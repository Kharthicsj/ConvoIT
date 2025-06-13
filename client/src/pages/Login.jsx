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

const Login = () => {
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleFormInput = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    async function handleLogin() {
        try {
            setLoading(true);
            const result = await axios.post(
                `${import.meta.env.VITE_API_URL}/signin`,
                formData
            );
            if (result.data.token) {
                localStorage.setItem("token", result.data.token);
                localStorage.setItem("loginTime", Date.now().toString());
            }
            toast.success(result.data.message, toastSuccessStyle);
            nav("/");
            window.location.reload()
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Login Failed",
                toastStyle
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatedCodeBg />
            <div className="relative z-10 grid md:grid-cols-2 h-full">
                <div className="hidden md:flex flex-col justify-center items-center h-full">
                    <div className="text-white">
                        <Origami
                            className="w-[160px] h-[160px]"
                            strokeWidth={0.5}
                        />
                    </div>
                    <p className="text-white text-3xl font-bold mt-4 text-center">
                        ConvoIT
                    </p>
                </div>

                <div className="grid gap-4 content-center justify-center items-center">
                    <p className="text-white text-center text-4xl font-bold font-overpass mb-10">
                        Login Form
                    </p>
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
                    <AuthSubmit
                        text={loading ? "Loading" : "Submit"}
                        onClick={handleLogin}
                    />
                    <Link
                        to={"/signup"}
                        className="text-white font-overpass text-center mt-2 hover:text-white/30"
                    >
                        Need Account ?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
