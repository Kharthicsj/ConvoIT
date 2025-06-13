import { useState, useEffect } from "react";
import axios from "axios";
import OrigamiPic from "../assets/origami.png";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { toastStyle, toastSuccessStyle } from "../utils/ToastStyles";

function AccountManagement() {
  const [tab, setTab] = useState("followers");
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Get logged in user info
        const userRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/loggedInUser`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userRes.data.user);

        const userId = userRes.data.user._id;

        // Fetch followers
        const followersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/follow/followers/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowers(followersRes.data.followers || []);

        // Fetch requests
        const requestsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/follow/requests/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequests(requestsRes.data.requests || []);
      } catch (err) {
        setFollowers([]);
        setRequests([]);
        toast.error("Failed to load account data.", toastStyle);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Accept follow request
  const handleAccept = async (requestUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/follow/accept`,
        {
          fromUserId: requestUser._id,
          toUserId: user._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowers((prev) => [...prev, requestUser]);
      setRequests((prev) => prev.filter((u) => u._id !== requestUser._id));
      toast.success(`Accepted ${requestUser.username}'s request`, toastSuccessStyle);
    } catch (err) {
      toast.error("Failed to accept request.", toastStyle);
    }
  };

  // Deny follow request
  const handleDeny = async (requestUser) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/follow/deny`,
        {
          fromUserId: requestUser._id,
          toUserId: user._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests((prev) => prev.filter((u) => u._id !== requestUser._id));
      toast.success(`Rejected ${requestUser.username}'s request`, toastSuccessStyle);
    } catch (err) {
      toast.error("Failed to reject request.", toastStyle);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-black/90 py-8 px-2">
        <div className="max-w-2xl mx-auto bg-transparent rounded-xl shadow-lg p-6 sm:p-10 border border-white/10">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <img
              src={user?.profilepic || OrigamiPic}
              alt={user?.username || ""}
              className="w-28 h-28 rounded-xl border-4 border-blue-500 object-cover shadow-md"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">{user?.username || ""}</h2>
              <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start">
                <span className="bg-[#23262F] px-4 py-1 rounded-full text-blue-400 font-semibold text-sm shadow">
                  {followers.length} Followers
                </span>
                <span className="bg-[#23262F] px-4 py-1 rounded-full text-yellow-400 font-semibold text-sm shadow">
                  {requests.length} Requests
                </span>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-[#23262F] mb-6">
            <button
              className={`flex-1 py-2 text-center transition-all duration-200 ${
                tab === "followers"
                  ? "border-b-2 border-blue-400 text-blue-400 font-bold"
                  : "text-gray-400 hover:text-blue-400"
              }`}
              onClick={() => setTab("followers")}
            >
              Followers
            </button>
            <button
              className={`flex-1 py-2 text-center transition-all duration-200 ${
                tab === "requests"
                  ? "border-b-2 border-yellow-400 text-yellow-400 font-bold"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
              onClick={() => setTab("requests")}
            >
              Requests
            </button>
          </div>
          {/* Tab Content */}
          <div>
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : tab === "followers" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followers.length === 0 ? (
                  <div className="text-gray-500 text-center col-span-2">No followers yet.</div>
                ) : (
                  followers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 bg-[#23262F] rounded-lg p-4 shadow hover:shadow-lg transition"
                    >
                      <img
                        src={user.profilepic || OrigamiPic}
                        alt={user.username}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-blue-400"
                      />
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requests.length === 0 ? (
                  <div className="text-gray-500 text-center col-span-2">No requests.</div>
                ) : (
                  requests.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-4 bg-[#23262F] rounded-lg p-4 shadow hover:shadow-lg transition"
                    >
                      <img
                        src={user.profilepic || OrigamiPic}
                        alt={user.username}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-yellow-400"
                      />
                      <span className="font-medium text-white">{user.username}</span>
                      <button
                        className="ml-auto px-4 py-1 bg-blue-400 text-white rounded-full text-xs font-semibold hover:bg-blue-500 transition"
                        onClick={() => handleAccept(user)}
                      >
                        Accept
                      </button>
                      <button
                        className="ml-2 p-2 rounded-full hover:bg-red-100 transition"
                        onClick={() => handleDeny(user)}
                        title="Reject"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountManagement;