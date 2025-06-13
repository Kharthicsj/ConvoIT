import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { Origami } from "lucide-react";
import axios from "axios";
import OrigamiPic from "../assets/origami.png";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import socket from "../utils/Socket";

const Homepage = () => {
    const { user } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const navigate = useNavigate();
    const { id: selectedChatId } = useParams();

    async function getFollowers() {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/follow/followers/${user._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (data.success) {
                setUsers(data.followers);
            }
        } catch (err) {
            console.error("Error fetching followers:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user?._id) {
            getFollowers();
            window.getFollowers = getFollowers;
        }
        return () => {
            delete window.getFollowers;
        };
    }, [user]);

    useEffect(() => {
        if (!user?._id) return;

        const handleOnlineUsers = (onlineUserIds) =>
            setOnlineUsers(onlineUserIds);
        const handleFollowerUpdated = () => getFollowers();

        socket.on("online-users", handleOnlineUsers);
        socket.on("follower-updated", handleFollowerUpdated);

        return () => {
            socket.off("online-users", handleOnlineUsers);
            socket.off("follower-updated", handleFollowerUpdated);
        };
    }, [user]);

    const isMobile = window.innerWidth < 768;

    return (
        <div>
            {user && <Header user={user} />}
            <div className="h-screen flex bg-black/90 text-white">
                {/* Sidebar */}
                <div
                    className={`${
                        isMobile && selectedChatId ? "hidden" : "block"
                    } w-full md:w-[400px] border-r border-white/10 overflow-y-auto`}
                >
                    <div className="p-4 text-xl text-center font-semibold">
                        Chats
                    </div>
                    <div>
                        {loading ? (
                            <div className="text-center py-10 text-gray-400">
                                Loading followers...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No followers yet
                            </div>
                        ) : (
                            users.map((userObj, index) => {
                                const isOnline = onlineUsers.includes(
                                    userObj._id
                                );
                                return (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            navigate(`/chat/${userObj._id}`)
                                        }
                                        className="flex items-center border-b border-white/10 gap-5 px-4 py-3 hover:bg-gray-700 cursor-pointer transition"
                                    >
                                        <img
                                            src={
                                                userObj.profilepic || OrigamiPic
                                            }
                                            alt={userObj.username}
                                            className="w-10 h-10 bg-white rounded object-cover"
                                        />
                                        <div>
                                            <p className="text-lg font-medium font-overpass">
                                                {userObj.username}
                                            </p>
                                            <span
                                                className={`text-sm font-overpass ${
                                                    isOnline
                                                        ? "text-green-400"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {isOnline
                                                    ? "• Online"
                                                    : "• Offline"}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat */}
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Homepage;
