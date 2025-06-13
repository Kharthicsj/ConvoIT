import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
    Plus,
    MoreVertical,
    PaperclipIcon,
    X,
} from "lucide-react";
import OrigamiPic from "../assets/origami.png";
import axios from "axios";
import { io as socketIO } from "socket.io-client";
import { Loader2 } from "lucide-react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { toastStyle, toastSuccessStyle } from "../utils/ToastStyles";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- Encryption helpers ---
const ENCRYPTION_PASSWORD =
    "your-very-secret-password" || import.meta.env.VITE_ENCRYPTION_PASSWORD;

async function getKey() {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(ENCRYPTION_PASSWORD),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode("chat-app-salt"),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptMessage(plainText) {
    const key = await getKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plainText)
    );
    // Return base64(iv + cipherText)
    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);
    return btoa(String.fromCharCode(...combined));
}

async function decryptMessage(cipherTextB64) {
    try {
        const combined = Uint8Array.from(atob(cipherTextB64), (c) =>
            c.charCodeAt(0)
        );
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const key = await getKey();
        const plainBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );
        return new TextDecoder().decode(plainBuffer);
    } catch {
        return "[Unable to decrypt]";
    }
}

function DecryptedText({ cipher }) {
    const [plain, setPlain] = useState("Decrypting...");
    useEffect(() => {
        let mounted = true;
        decryptMessage(cipher).then((res) => {
            if (mounted) setPlain(res);
        });
        return () => {
            mounted = false;
        };
    }, [cipher]);
    return plain;
}

// --- Chat Component ---
function Chat() {
    const { id } = useParams();
    const [chatUser, setChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const dropdownRef = useRef(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const userObj = JSON.parse(localStorage.getItem("user"));
    const userId = userObj?._id;

    const [isBlocked, setIsBlocked] = useState(false);
    const [blockNotice, setBlockNotice] = useState("");

    // --- SOCKET CONNECTION AND BLOCK HANDLING ---
    useEffect(() => {
        socketRef.current = socketIO(SOCKET_URL, {
            withCredentials: true,
        });
        socketRef.current.emit("join", userId);

        // Listen for new messages
        socketRef.current.on("new-message", (msg) => {
            if (
                (msg.senderId === id && msg.receiverId === userId) ||
                (msg.senderId === userId && msg.receiverId === id)
            ) {
                setMessages((prev) => [
                    ...prev,
                    { ...msg, fromMe: msg.senderId === userId },
                ]);
            }
        });

        // Listen for block updates
        socketRef.current.on("block-update", (data) => {
            if (data.blockedUserId === id || data.blockedUserId === userId) {
                setIsBlocked(true);
                setBlockNotice(data.message);
                setMessages([]);
                toast(data.message, { icon: "🚫" });
            }
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [id, userId]);

    // --- CHECK BLOCK STATUS ON LOAD ---
    useEffect(() => {
        async function checkBlockStatus() {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/user/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                    setChatUser(res.data.user);
                }
                // Check if blocked (by you or by them)
                const blockRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/follow/followers/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const blockedArr = blockRes.data?.followers?.blocked || [];
                if (blockedArr.includes(id)) {
                    setIsBlocked(true);
                }
            } catch {
                setChatUser(null);
            }
        }
        checkBlockStatus();
    }, [id, userId]);

    // --- FETCH MESSAGES ---
    useEffect(() => {
        async function fetchMessages() {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/message/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (data.success) {
                    setMessages(
                        data.messages.map((msg) => ({
                            ...msg,
                            fromMe: msg.senderId === userId,
                        }))
                    );
                }
            } catch {
                setMessages([]);
            }
        }
        if (!isBlocked) fetchMessages();
        else setMessages([]);
    }, [id, userId, isBlocked]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // Handle file/image selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith("image/")) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setSelectedFile(null);
        } else {
            setSelectedFile(file);
            setPreviewUrl(null);
            setSelectedImage(null);
        }
    };

    const handleRemoveAttachment = () => {
        setSelectedFile(null);
        setSelectedImage(null);
        setPreviewUrl(null);
    };

    // Convert file to base64
    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    // Send message (text, image, file)
    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile && !selectedImage) return;

        const token = localStorage.getItem("token");
        let payload = {
            senderId: userId,
            receiverId: id,
            text: message.trim() ? await encryptMessage(message.trim()) : "",
        };

        if (selectedImage) {
            payload.image = await fileToBase64(selectedImage);
        }
        if (selectedFile) {
            payload.file = {
                base64: await fileToBase64(selectedFile),
                name: selectedFile.name,
                type: selectedFile.type,
            };
        }

        // Optimistically add message with status "sending"
        const tempId = Date.now().toString();
        setMessages((prev) => [
            ...prev,
            {
                ...payload,
                _id: tempId,
                fromMe: true,
                status: "sending",
                createdAt: new Date().toISOString(),
            },
        ]);
        setMessage("");
        handleRemoveAttachment();

        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/message/send`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === tempId
                            ? { ...data.message, fromMe: true, status: "sent" }
                            : msg
                    )
                );
            }
        } catch (err) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempId ? { ...msg, status: "failed" } : msg
                )
            );
            alert("Failed to send message");
        }
    };

    const handleBlockUser = async () => {
        setShowDropdown(false);
        if (
            !window.confirm(
                "Are you sure you want to block this user? This will clear your chat and prevent further messaging."
            )
        )
            return;
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_API_URL}/user/block/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("User blocked successfully.", toastSuccessStyle);
            // UI will update via socket event
        } catch (err) {
            toast.error("Failed to block user.", toastStyle);
        }
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url, { mode: "cors" });
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename || "file";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            alert("Failed to download file.");
        }
    };

    const handleClearChat = async () => {
        setShowDropdown(false);
        if (
            !window.confirm(
                "Are you sure you want to clear this chat? This cannot be undone."
            )
        )
            return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/chat/clear/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages([]);
        } catch (err) {
            alert("Failed to clear chat.");
        }
    };

    const renderMessageContent = (msg) => {
        // If it's an image
        if (msg.image) {
            return (
                <div className="flex flex-col items-start">
                    <img
                        src={msg.image}
                        alt="sent"
                        className="max-w-xs max-h-60 rounded-lg mb-1"
                    />
                    {/* Download button for receiver */}
                    {!msg.fromMe && (
                        <button
                            type="button"
                            onClick={() =>
                                handleDownload(
                                    msg.image,
                                    `image_${msg._id || ""}.jpg`
                                )
                            }
                            className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                            title="Download image"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    )}
                </div>
            );
        }
        // If it's a file (non-image)
        if (msg.file && msg.file.url) {
            const isImage = msg.file.type && msg.file.type.startsWith("image/");
            return (
                <div className="flex flex-col items-start">
                    {isImage ? (
                        <img
                            src={msg.file.url}
                            alt={msg.file.name}
                            className="max-w-xs max-h-60 rounded-lg mb-1"
                        />
                    ) : (
                        <div className="flex items-center gap-2 mb-1">
                            <PaperclipIcon
                                size={18}
                                className="text-blue-700"
                            />
                            <span className="text-blue-700 underline text-sm">
                                {msg.file.name}
                            </span>
                        </div>
                    )}
                    {/* Download button for receiver */}
                    {!msg.fromMe && (
                        <button
                            type="button"
                            onClick={() =>
                                handleDownload(msg.file.url, msg.file.name)
                            }
                            className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition"
                            title="Download file"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    )}
                </div>
            );
        }
        // Encrypted text
        if (msg.text) {
            return <DecryptedText cipher={msg.text} />;
        }
        return "";
    };

    const renderStatusIcon = (msg) => {
        if (msg.fromMe && msg.status === "sending") {
            return (
                <Loader2
                    className="animate-spin ml-2 inline-block text-gray-400"
                    size={16}
                />
            );
        }
        if (msg.fromMe && msg.status === "failed") {
            return <span className="ml-2 text-red-500 text-xs">Failed</span>;
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Blocked Notice */}
            {isBlocked && (
                <div className="bg-red-100 text-red-700 text-center py-2 font-semibold">
                    {blockNotice}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-black/90 shadow-md relative">
                <img
                    src={chatUser?.profilepic || OrigamiPic}
                    alt={chatUser?.username || "User"}
                    className="w-10 h-10 rounded-full object-cover bg-white"
                />
                <span className="text-lg font-semibold text-white tracking-wide flex-1">
                    {chatUser?.username || "Loading..."}
                </span>
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        className="p-2 cursor-pointer rounded-full hover:bg-gray-700 text-gray-300 transition"
                        onClick={() => setShowDropdown((prev) => !prev)}
                    >
                        <MoreVertical size={22} />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-md z-30">
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={handleBlockUser}
                                disabled={isBlocked}
                            >
                                Block User
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={handleClearChat}
                                disabled={isBlocked}
                            >
                                Clear Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[oklch(20%_0_0)]">
                {messages.map((msg, idx) => (
                    <div
                        key={msg._id || idx}
                        className={`flex ${
                            msg.fromMe ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`px-5 py-3 rounded-2xl max-w-lg break-words shadow-md
                                ${
                                    msg.fromMe
                                        ? "bg-[oklch(35%_0.03_250)] text-white rounded-br-md border border-[oklch(35%_0.03_250)]"
                                        : "bg-gradient-to-br from-[oklch(86%_0.036_80)] to-[oklch(96%_0.02_80)] text-black rounded-bl-md border border-[oklch(86%_0.036_80)]"
                                }
                            `}
                        >
                            {renderMessageContent(msg)}
                            {renderStatusIcon(msg)}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-2 p-4 border-t border-gray-800 bg-black/90"
            >
                {/* File/Image Attach */}
                <label className="p-2 cursor-pointer rounded-full hover:bg-gray-700 text-gray-400 transition">
                    <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isBlocked}
                    />
                    <Plus size={22} />
                </label>
                <input
                    type="text"
                    className="flex-1 px-4 py-2 rounded-full bg-gray-700 text-white outline-none border border-gray-600 focus:border-cream-100 transition"
                    placeholder={
                        isBlocked
                            ? "You cannot send messages to this user."
                            : "Type a message"
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isBlocked}
                />
                <button
                    type="submit"
                    className="cursor-pointer ml-2 px-5 py-2 rounded-full bg-gradient-to-br from-[oklch(86%_0.036_80)] to-[oklch(96%_0.02_80)] text-black font-semibold hover:from-[oklch(90%_0.04_80)] hover:to-[oklch(98%_0.02_80)] transition shadow"
                    disabled={isBlocked}
                >
                    Send
                </button>
                {/* Preview */}
                {(selectedImage || selectedFile) && (
                    <div className="flex items-center ml-2">
                        {selectedImage && (
                            <img
                                src={previewUrl}
                                alt="preview"
                                className="w-10 h-10 rounded object-cover mr-2"
                            />
                        )}
                        {selectedFile && (
                            <span className="text-xs text-white bg-gray-700 px-2 py-1 rounded mr-2">
                                {selectedFile.name}
                            </span>
                        )}
                        <button
                            type="button"
                            className="text-red-400"
                            onClick={handleRemoveAttachment}
                            disabled={isBlocked}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default Chat;
