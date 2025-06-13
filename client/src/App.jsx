import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { isSessionExpired } from "./utils/SessionValidator";
import { useEffect, useState, createContext } from "react";
import toast from "react-hot-toast";
import { toastStyle } from "./utils/ToastStyles";
import axios from "axios";
import Context from "./context";
import socket from "./utils/Socket";

export const NotificationContext = createContext();

function App() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isSessionExpired()) {
            toast.error(
                "You're not logged in, Please sign in to continue.",
                toastStyle
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return;
        }

        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/loggedInUser`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.data.success) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
            } catch (err) {
                console.error("User fetch error:", err);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
    if (user?._id) {
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("join", user._id);
    }
    return () => {
        if (socket.connected) socket.disconnect();
    };
}, [user]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/notifications`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (data.success) {
                    setNotifications(
                        data.notifications.map((n) => ({
                            from: n.fromUser?.username || "Unknown User",
                            fromId: n.fromUser?._id || n.fromUser,
                            message: n.message,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        if (user?._id) fetchNotifications();
    }, [user]);

    return (
        <Context.Provider value={user}>
            <NotificationContext.Provider value={{ notifications, setNotifications }}>
                <div>
                    <Outlet context={{ user }} />
                    <Toaster position="top-right" reverseOrder={false} />
                </div>
            </NotificationContext.Provider>
        </Context.Provider>
    );
}

export default App;
