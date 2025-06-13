import {
    Origami,
    Search,
    User,
    Settings,
    LogOut,
    Bell,
    Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import OrigamiPic from "../assets/Origami.png";
import toast from "react-hot-toast";
import { toastStyle, toastSuccessStyle } from "../utils/ToastStyles";
import socket from "../utils/Socket";
import { NotificationContext } from "../App";

function Header({ user }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [requestedUsers, setRequestedUsers] = useState(new Set());
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const navigate = useNavigate();

    const { notifications, setNotifications } = useContext(NotificationContext);

    const dropdownRef = useRef(null); //account DropDown ref
    const notifDropdownRef = useRef(null);
    const searchDropdownRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchTerm.trim()) return setFilteredUsers([]);

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/get-user`,
                    { searchData: searchTerm }
                );
                if (data.success) setFilteredUsers(data.data);
            } catch (err) {
                console.error("Search error:", err);
            }
        };

        fetchUsers();
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }

            // Notification dropdown
            if (
                notifDropdownRef.current &&
                !notifDropdownRef.current.contains(e.target)
            ) {
                setShowNotifDropdown(false);
            }

            // Search dropdown
            if (
                searchDropdownRef.current &&
                !searchDropdownRef.current.contains(e.target)
            ) {
                // Only close if searchTerm is not empty and dropdown is open
                if (searchTerm && filteredUsers.length > 0) {
                    setSearchTerm("");
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [searchTerm, filteredUsers]);

    function handleLogout() {
        localStorage.clear();
        location.reload();
    }

    const handleFollowRequest = async (userId) => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/follow/request`,
                { fromUserId: user._id, toUserId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setRequestedUsers((prev) => new Set(prev).add(userId));
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Follow Request Failed",
                toastStyle
            );
        }
    };

    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    const deleteNotification = async (indexToDelete) => {
        const notif = notifications[indexToDelete];
        const token = localStorage.getItem("token");
        const toUserId = user?._id;

        let fromUserId = notif?.fromId || notif?.from?._id || notif?.senderId;

        if (typeof fromUserId === "object" && fromUserId?.$oid) {
            fromUserId = fromUserId.$oid;
        }

        const isValidObjectId = (id) =>
            typeof id === "string" &&
            id.length === 24 &&
            /^[a-f\d]{24}$/i.test(id);

        if (!isValidObjectId(fromUserId) || !isValidObjectId(toUserId)) {
            console.error("Invalid ObjectId:", { fromUserId, toUserId });
            toast.error(
                "Failed to deny request: Invalid ID format",
                toastStyle
            );
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/follow/deny`,
                { fromUserId, toUserId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(
                `Denied request from ${notif?.from?.name || "user"}`,
                toastSuccessStyle
            );
        } catch (err) {
            toast.error("Failed to deny request", toastStyle);
        }

        const updated = notifications.filter((_, idx) => idx !== indexToDelete);
        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
    };

    useEffect(() => {
        if (!user?._id) return;

        const handleFollowRequest = (data) => {
            setNotifications((prev) => {
                const updated = [
                    {
                        from: data.from,
                        fromId: data.fromId,
                        message: data.message,
                    },
                    ...prev,
                ];
                localStorage.setItem("notifications", JSON.stringify(updated));
                return updated;
            });
            toast.success(
                `New follow request from ${data.from}`,
                toastSuccessStyle
            );
        };

        const handleFollowAccepted = (data) => {
            setNotifications((prev) => {
                const updated = prev.filter(
                    (notif) =>
                        notif.fromId !== data.byUserId &&
                        notif.from !== data.byUserId
                );
                localStorage.setItem("notifications", JSON.stringify(updated));
                return updated;
            });
            toast.success(data.message, toastSuccessStyle);
        };

        socket.on("follow-request", handleFollowRequest);
        socket.on("follow-accepted", handleFollowAccepted);

        return () => {
            socket.off("follow-request", handleFollowRequest);
            socket.off("follow-accepted", handleFollowAccepted);
        };
    }, [user, setNotifications]);

    const acceptRequest = async (notif, index) => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `${import.meta.env.VITE_API_URL}/follow/accept`,
                {
                    fromUserId: notif.fromId,
                    toUserId: user._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(`Accepted ${notif.from}`, toastSuccessStyle);

            // Remove notification
            const updated = notifications.filter((_, idx) => idx !== index);
            setNotifications(updated);
            localStorage.setItem("notifications", JSON.stringify(updated));

            // Optional: Refresh followers
            if (typeof window.getFollowers === "function") {
                window.getFollowers(); // or lift getFollowers from Homepage via context
            }
        } catch (err) {
            toast.error("Failed to accept request", toastStyle);
        }
    };

    return (
        <header className="bg-black/90 text-white px-4 py-3 sm:px-6 relative">
            {/* Top Row: Logo + Account */}
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link
                    to={"/"}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Origami className="w-7 h-7 text-white" strokeWidth={1} />
                    <p className="text-lg font-semibold">ConvoIt</p>
                </Link>

                <div
                    className="flex items-center gap-4 relative"
                    ref={dropdownRef}
                >
                    {/* Bell Icon with Count */}
                    <div className="relative cursor-pointer" ref={notifDropdownRef}>
                        <button
                            onClick={() =>
                                setShowNotifDropdown(!showNotifDropdown)
                            }
                        >
                            <Bell className="w-5 h-5 text-white mt-2 cursor-pointer" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {showNotifDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-md shadow-lg z-30 max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="text-sm p-4 text-gray-500 text-center">
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map((notif, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col text-left">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    From: {notif.from}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        acceptRequest(
                                                            notif,
                                                            index
                                                        )
                                                    }
                                                    className="px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteNotification(
                                                            index
                                                        )
                                                    }
                                                    className="text-red-500 text-sm hover:text-red-700"
                                                >
                                                    <Trash2 />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Account Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition text-sm cursor-pointer"
                        >
                            <User className="w-5 h-5" />
                            <span className="hidden sm:inline">Account</span>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-md z-30">
                                <button
                                    className="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate("/myAccount");
                                    }}
                                >
                                    <div className="flex flex-row justify-baseline items-center gap-4">
                                        <Settings />
                                        My Profile
                                    </div>
                                </button>
                                <button
                                    className="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={handleLogout}
                                >
                                    <div className="flex flex-row justify-baseline items-center gap-4">
                                        <LogOut />
                                        Logout
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Bar: Only moves to second line on mobile */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[40%] w-full">
                <div className="flex items-center bg-white/10 px-4 py-2 rounded-md backdrop-blur-sm w-full">
                    <Search className="w-4 h-4 text-gray-300 mr-2" />
                    <input
                        type="text"
                        placeholder="Search Users..."
                        className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Search Dropdown */}
                {searchTerm && filteredUsers.length > 0 && (
                    <div className="absolute mt-2 bg-white text-black w-full rounded shadow-lg z-20 max-h-96 overflow-y-auto" ref={searchDropdownRef}>
                        {filteredUsers.slice(0, 8).map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-4 px-4 py-2 hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user?.profilepic || OrigamiPic}
                                        alt={user.username}
                                        className="w-10 h-10 object-cover rounded-md"
                                    />
                                    <div>
                                        <p className="font-semibold">
                                            {user.username}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {user._id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    disabled={requestedUsers.has(user._id)}
                                    onClick={() =>
                                        handleFollowRequest(user._id)
                                    }
                                    className={`px-3 py-1 rounded text-sm transition ${
                                        requestedUsers.has(user._id)
                                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                            : "bg-blue-800 text-white hover:bg-blue-900"
                                    }`}
                                >
                                    {requestedUsers.has(user._id)
                                        ? "Requested"
                                        : "+ Follow"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
