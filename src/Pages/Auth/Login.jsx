import React, { useState } from "react";
import Button from "../../Component/Atoms/Button/Button";
import Input from "../../Component/Atoms/InputFields/Inputfield";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { login } from "../../features/slices/userSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../../Component/Sidebar/logo.png";


// You can use an icon library or SVG for the eye icon. Here's a simple inline SVG example:
const EyeIcon = ({ open }) => (
  open ? (
    <AiOutlineEye />
  ) : (
    <AiOutlineEyeInvisible />
  )
);

export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // <-- new state for toggling password
  const dispatch = useDispatch();
  const selector = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    dispatch(login({ email: form.email, password: form.password }))
      .then((result) => {
        if (login.fulfilled.match(result)) {
          toast.success("Login Successful");
          navigate("/dashboard");
        } else {
          const { message, code } = result.payload || {};
          console.error(`Login failed [${code}]: ${message}`);
          toast.error(message || "Login failed");
        }
      })
      .catch((error) => {
        console.error("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      })
      .finally(() => setLoading(false));
  };

  let { loading: selectorLoading, error } = selector ? selector : {};

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#bdd5fc" }}
    >
      <div
        className="w-full max-w-md p-8 bg-[#ffffff] rounded-xl shadow-lg"
        style={{
          backgroundColor: theme.colors.card,
          color: theme.colors.textPrimary,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
            fullWidth
            disabled={loading}
          />

          {/* Password input with eye icon */}
          <div className="relative w-full">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              fullWidth
              disabled={loading}
            />
            <div
              className={`absolute top-[38px] right-3 text-xl ${loading ? 'text-gray-400' : 'text-black-500 cursor-pointer'}`}
              onClick={!loading ? togglePassword : undefined}
              role="button"
              tabIndex={loading ? -1 : 0}
              onKeyDown={(e) => !loading && e.key === "Enter" && togglePassword()}
            >
              <EyeIcon open={showPassword} />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loaderText="Signing in..."
            className="w-full"
            disabled={loading}
          >
            Login
          </Button>
        </form>

        <p
          className="mt-4 text-sm text-center"
          style={{ color: theme.colors.textSecondary }}
        >
          <button
            type="button"
            onClick={() => !loading && navigate("/forgot-password")}
            className={`font-medium hover:underline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ color: theme.colors.textSecondary }}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}
