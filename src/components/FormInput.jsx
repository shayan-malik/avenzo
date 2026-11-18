import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({ icon: Icon, type = "text", ...props }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="relative">
            {Icon && (
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            )}

            <input
                type={isPassword && show ? "text" : type}
                {...props}
                className={`w-full rounded-xl border border-white/10 bg-white/5 py-3 outline-none transition placeholder:text-muted focus:border-accent/60 focus:bg-white/[0.07] ${
                    Icon ? "pl-11" : "pl-4"
                } ${isPassword ? "pr-11" : "pr-4"}`}
            />

            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
                >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
    );
}