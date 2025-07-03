import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Input from "../../Component/Atoms/InputFields/Inputfield";
import Button from "../../Component/Atoms/Button/Button";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { resendResetOtps, verifyResetOtps } from "../../features/slices/userSlice";
import { IoIosArrowBack } from "react-icons/io";

export default function VerifyResetOtp() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();


  const email = state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setLoading(true);
    dispatch(verifyResetOtps({ email, otp: fullOtp }))
      .then((result) => {
        if (verifyResetOtps.fulfilled.match(result)) {
          toast.success("OTP verified");
          navigate("/reset-password", { state: { email } });
        } else {
          const message = result.payload?.message || "Verification failed";
          toast.error(message);
        }
      })
      .catch((err) => {
        console.error("Unexpected error:", err);
        toast.error("Unexpected error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResendOtp = () => {
    dispatch(resendResetOtps({ email }))
      .then((result) => {
        if (resendResetOtps.fulfilled.match(result)) {
          toast.success("OTP resent successfully");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        } else {
          toast.error(result.payload?.message || "Failed to resend OTP");
        }
      })
      .catch((err) => {
        console.error("Resend OTP error:", err);
        toast.error("Unexpected error occurred");
      });
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
          <IoIosArrowBack />
        </Button>
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-12 text-xl text-center border rounded-md focus:outline-none"
                style={{
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.borderLight,
                }}
              />
            ))}
          </div>
          <div className="flex  justify-between">


            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              loaderText="Verifying..."
            >
              Verify
            </Button>

            <Button


              type="button"
              variant="primary"
              // size="lg"
              fullWidth
              onClick={handleResendOtp}
              loaderText="Verifying..."



            >
              Resend OTP
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
