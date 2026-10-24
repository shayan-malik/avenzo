import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";

export default function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      await loginWithGoogle(response.credential);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in failed")}
        theme="filled_black"
        shape="rectangular"
        text="continue_with"
      />
    </div>
  );
}