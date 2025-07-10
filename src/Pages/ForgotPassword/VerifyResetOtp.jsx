import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Button from "../../Component/Atoms/Button/Button";
import { toast } from "react-toastify";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { resendResetOtps, verifyResetOtps } from "../../features/slices/userSlice";
import { IoIosArrowBack } from "react-icons/io";
import logo from "../../Component/Sidebar/logo.png";

export default function VerifyResetOtp() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const email = state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // Handle OTP input
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

  // OTP verification
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
          toast.error(result.payload?.message || "Verification failed");
        }
      })
      .catch(() => toast.error("Unexpected error occurred"))
      .finally(() => setLoading(false));
  };

  // Resend OTP with timer
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    dispatch(resendResetOtps({ email }))
      .then((result) => {
        if (resendResetOtps.fulfilled.match(result)) {
          toast.success("OTP resent successfully");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          setResendTimer(30); // Start 30s timer
        } else {
          toast.error(result.payload?.message || "Failed to resend OTP");
        }
      })
      .catch(() => toast.error("Unexpected error occurred"));
  };

  // Countdown effect
  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#bdd5fc" }}
    >
      <div
        className="w-full bg-white max-w-md p-6 md:p-8 rounded-xl shadow-2xl"
        style={{
          backgroundColor: theme.colors.card,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => !loading && navigate(-1)}
          className={`mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          <IoIosArrowBack className="text-lg" />
        </Button>

        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                aria-label={`OTP digit ${idx + 1}`}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className={`w-12 h-12 md:w-14 md:h-14 text-xl text-center border rounded-lg focus:outline-none focus:ring-2 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: theme.colors.input,
                  color: theme.colors.textPrimary,
                  borderColor: theme.colors.borderLight,
                  boxShadow: `0 1px 2px ${theme.colors.borderLight}`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base"
              loading={loading}
              loaderText="Verifying..."
              disabled={loading || otp.join('').length !== 6}
            >
              Verify
            </Button>

            <Button
              type="button"
              variant="outline"
              className={`w-full h-12 text-base ${(resendTimer > 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
