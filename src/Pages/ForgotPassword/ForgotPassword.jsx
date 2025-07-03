import React, { useState } from "react";
import Input from "../../Component/Atoms/InputFields/Inputfield";
import Button from "../../Component/Atoms/Button/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useDispatch } from "react-redux";
import { requestResetOtp } from "../../features/slices/userSlice";
import { IoIosArrowBack } from "react-icons/io";
export default function ForgotPassword() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!email) return toast.error("Email is required");
    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email address");
    }

    try {
      setLoading(true);
      const result = await dispatch(requestResetOtp({ email }));

      if (requestResetOtp.fulfilled.match(result)) {
        toast.success("OTP sent to your email");
        navigate("/verify-reset-otp", { state: { email } });
      } else {
        const { message, code } = result.payload || {};
        console.error(`requestResetOtp failed [${code}]: ${message}`);
        toast.error(message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div
        className="w-full max-w-md p-8 shadow-xl"
        style={{
          backgroundColor: theme.colors.card,
          color: theme.colors.textPrimary,
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <IoIosArrowBack/>
        </Button>
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            error={emailError}
            fullWidth
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loaderText="Sending OTP..."
          >
            Send OTP
          </Button>
        </form>
      </div>
    </div>
  );
}
