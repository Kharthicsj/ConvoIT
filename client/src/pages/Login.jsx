import AuthBGVdo from "../assets/AuthFormBGVdo.mp4";
import AuthSubmit from "../components/buttons/AuthSubmit";
import AuthInput from "../components/Inputs/AuthInput";
import { Link, useNavigate } from "react-router-dom";
import { Origami } from "lucide-react";
import { useState } from "react";
import { toastStyle, toastSuccessStyle } from "../utils/ToastStyles";
import axios from "axios";
import toast from "react-hot-toast";

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
        <div className="relative h-screen w-full overflow-hidden">
            <video
                className="absolute inset-0 w-full h-full object-cover z-0"
                src={AuthBGVdo}
                autoPlay
                loop
                muted
                disablePictureInPicture
                controls={false}
            />

            <div className="absolute inset-0 bg-black/50 z-0" />

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
