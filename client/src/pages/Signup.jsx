import AuthSubmit from "../components/buttons/AuthSubmit";
import AuthInput from "../components/Inputs/AuthInput";
import { Link, useNavigate } from "react-router-dom";
import { Origami } from "lucide-react";
import { useState } from "react";
import { toastStyle, toastSuccessStyle } from "../utils/ToastStyles";
import axios from "axios";
import toast from "react-hot-toast";

const codeChars = ["0", "1", "<", ">", "/", "{", "}", "=", ";", "(", ")", "[", "]"];

function AnimatedCodeBg() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-12 grid-rows-8 gap-2 opacity-30 animate-pulse select-none">
                {Array.from({ length: 96 }).map((_, i) => (
                    <span
                        key={i}
                        className={`text-green-400 text-lg font-mono animate-bounce`}
                        style={{ animationDelay: `${(i % 12) * 0.1}s` }}
                    >
                        {codeChars[Math.floor(Math.random() * codeChars.length)]}
                    </span>
                ))}
            </div>
            <div className="absolute inset-0 bg-black/60" />
        </div>
    );
}

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilepic: "",
    });

    const handleFormInput = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                profilepic: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            profilepic: "",
        }));
    };

    const isValidEmail = (email) => {
        const parts = email.split("@");
        return (
            email.includes("@") &&
            parts.length === 2 &&
            parts[0].length > 0 &&
            parts[1].length > 2 &&
            parts[1].includes(".") &&
            !email.includes(" ")
        );
    };

    const isValidUsername = (username) => {
        const usernameRegex = /^[\w.@-]{3,20}$/;
        return usernameRegex.test(username);
    };

    const isStrongPassword = (password) => {
        if (password.length < 8) return false;
        return (
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[^\w\s]/.test(password)
        );
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.username ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            return toast.error(
                "Please fill all the mandatory fields",
                toastStyle
            );
        }

        if (!isValidEmail(formData.email)) {
            return toast.error("Invalid email format", toastStyle);
        }

        if (!isValidUsername(formData.username)) {
            return toast.error(
                "Username should not contain empty space",
                toastStyle
            );
        }

        if (!isStrongPassword(formData.password)) {
            return toast.error(
                "Password must include uppercase, lowercase, number, and symbol, and be at least 8 characters long.",
                toastStyle
            );
        }

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match", toastStyle);
        }

        try {
            setLoading(true);
            const result = await axios.post(
                `${import.meta.env.VITE_API_URL}/signup`,
                formData
            );
            nav("/login");
            return toast.success(result.data.message, toastSuccessStyle);
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Signup failed",
                toastStyle
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatedCodeBg />
            <div className="relative z-10 grid md:grid-cols-2 p-4">
                <div className="hidden md:flex flex-col justify-center items-center h-full">
                    <Origami
                        className="w-[160px] h-[160px] text-white"
                        strokeWidth={0.5}
                    />
                    <p className="text-white text-3xl font-bold mt-4 text-center">
                        ConvoIT
                    </p>
                </div>

                <form
                    onSubmit={handleFormSubmit}
                    className="w-full max-w-sm mx-auto grid gap-4 px-4 py-6"
                >
                    <p className="text-white text-center text-4xl font-bold font-overpass mb-10">
                        Signup Form
                    </p>
                    <div className="flex flex-col items-center">
                        <label
                            htmlFor="profile-upload"
                            className="w-32 h-32 rounded-full bg-white flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 relative overflow-hidden"
                        >
                            {formData.profilepic ? (
                                <img
                                    src={formData.profilepic}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <Origami
                                    className="text-gray-400 w-10 h-10"
                                    strokeWidth={1}
                                />
                            )}
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>

                        {formData.profilepic && (
                            <button
                                onClick={handleRemoveImage}
                                className="mt-2 text-red-400 hover:underline text-sm cursor-pointer"
                            >
                                Remove Image
                            </button>
                        )}
                    </div>

                    <AuthInput
                        name="username"
                        label="Username"
                        placeholder="Username"
                        type="text"
                        onChange={handleFormInput}
                    />
                    <AuthInput
                        name="email"
                        label="Email"
                        placeholder="Email"
                        type="email"
                        onChange={handleFormInput}
                    />
                    <AuthInput
                        name="password"
                        label="Password"
                        placeholder="Password"
                        type="password"
                        onChange={handleFormInput}
                    />
                    <AuthInput
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        type="password"
                        onChange={handleFormInput}
                    />

                    <AuthSubmit text={loading ? "Loading..." : "Submit"} />
                    <Link
                        to="/login"
                        className="text-white font-overpass text-center mt-2 hover:text-white/30"
                    >
                        Already have an Account ?
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Signup;
