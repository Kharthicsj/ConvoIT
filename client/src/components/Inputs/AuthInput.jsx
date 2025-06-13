import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

function AuthInput(props) {
    const [showEyeIcon, setShowEyeIcon] = useState(false);
    const [showPassword, setShowPassword] = useState(props.type);

    useEffect(() => {
        if (props.type === "password") {
            setShowEyeIcon(true);
        } else {
            setShowEyeIcon(false);
        }
    }, [props.type]);

    function tooglePasswordVisiblity(event) {
        event.preventDefault();
        showPassword === "password"
            ? setShowPassword("name")
            : setShowPassword("password");
    }

    return (
        <div className="flex flex-col gap-2 w-sm">
            <label className="font-overpass text-xl font-bold text-white">
                {props.label}:
            </label>
            <div className="relative w-full">
                <input
                    type={showPassword}
                    name={props.name}
                    value={props.value}
                    placeholder={props.placeholder}
                    onChange={props.onChange}
                    className="bg-white w-full h-10 p-4 rounded"
                    required
                />
                {showEyeIcon && (
                    <div
                        className="absolute text-black right-0 top-0 p-2 cursor-pointer"
                        onClick={tooglePasswordVisiblity}
                    >
                        {showPassword === "password" ? <EyeOff /> : <Eye />}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthInput;
