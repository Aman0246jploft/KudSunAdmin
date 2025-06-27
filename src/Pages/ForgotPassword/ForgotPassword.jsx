import React, { useState } from "react";
import Input from "../../Component/Atoms/InputFields/Inputfield";
import Button from "../../Component/Atoms/Button/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { useDispatch } from "react-redux";
import { requestResetOtp } from "../../features/slices/userSlice";


export default function ForgotPassword() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (number) => {
    const regex = /^[0-9]{10,15}$/; // Accepts 10 to 15 digits
    return regex.test(number);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (!validatePhone(value)) {
      setPhoneError("Enter a valid phone number (10–15 digits)");
    } else {
      setPhoneError("");
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!phoneNumber) return toast.error("Phone number is required");
    if (!validatePhone(phoneNumber)) {
      return toast.error("Please enter a valid phone number");
    }

    try {
      setLoading(true);
      const result = await dispatch(requestResetOtp({ phoneNumber }));

      if (requestResetOtp.fulfilled.match(result)) {
        toast.success("OTP sent to your phone");
        navigate("/verify-reset-otp", { state: { phoneNumber } });
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
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter your phone number"
            error={phoneError}
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
