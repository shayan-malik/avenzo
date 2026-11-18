import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "../components/Logo.jsx";
import FormInput from "../components/FormInput.jsx";
import GoogleButton from "../components/GoogleButton.jsx";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (form.password !== form.confirm_password) {
      return toast.error("Passwords do not match");
    }

    setSubmitting(true);

    try {
      await api.post("/auth/signup", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      await login(form.email, form.password);

      toast.success("Account created successfully");
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

      <h1 className="text-center text-2xl font-extrabold">Create your account</h1>
      <p className="mb-6 mt-1 text-center text-sm text-muted">
        Join Avenzo and start shopping
      </p>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <FormInput
          icon={User}
          name="first_name"
          placeholder="First name"
          aria-label="First name"
          autoComplete="given-name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <FormInput
          icon={User}
          name="last_name"
          placeholder="Last name"
          aria-label="Last name"
          autoComplete="family-name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
      </div>

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

      <div className="mb-4">
        <FormInput
          icon={Phone}
          name="phone"
          placeholder="Phone (optional)"
          aria-label="Phone"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <FormInput
          icon={Lock}
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-6">
        <FormInput
          icon={Lock}
          type="password"
          name="confirm_password"
          placeholder="Confirm password"
          aria-label="Confirm password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={handleChange}
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-gold w-full rounded-full py-3 disabled:opacity-60"
      >
        {submitting ? "Please wait..." : "Sign up"}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-white/10" />
        OR
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}