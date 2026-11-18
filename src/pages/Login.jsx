import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";
import Logo from "../components/Logo.jsx";
import FormInput from "../components/FormInput.jsx";
import GoogleButton from "../components/GoogleButton.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass animate-fade-up mx-auto w-full max-w-md rounded-3xl p-8"
    >
      <div className="mb-6 flex justify-center">
        <Logo className="h-20" />
      </div>

      <h1 className="text-center text-2xl font-extrabold">Welcome back</h1>
      <p className="mb-6 mt-1 text-center text-sm text-muted">
        Log in to continue shopping
      </p>

      <div className="mb-4">
        <FormInput
          icon={Mail}
          type="email"
          name="email"
          placeholder="Email address"
          aria-label="Email address"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-6">
        <FormInput
          icon={Lock}
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-gold w-full rounded-full py-3 disabled:opacity-60"
      >
        {submitting ? "Please wait..." : "Login"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}