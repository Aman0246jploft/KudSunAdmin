import React, { useState } from "react";
import Input from "../../Component/Atoms/InputFields/Inputfield";
import Button from "../../Component/Atoms/Button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import { resetPassword } from "../../features/slices/userSlice";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import logo from "../../Component/Sidebar/logo.png";

export default function ResetPassword() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const email = state?.email;

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  // State to toggle password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value) => {
    let error = "";
    if (!value) {
      error = "This field is required";
    } else {
      if (name === "newPassword") {
        if (value.length < 6) error = "Password must be at least 6 characters";
      }
      if (name === "confirmPassword" && value !== form.newPassword) {
        error = "Passwords do not match";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "newPassword" && form.confirmPassword) {
      // Re-validate confirmPassword if newPassword changes
      validateField("confirmPassword", form.confirmPassword);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();

    const isNewPasswordValid = validateField("newPassword", form.newPassword);
    const isConfirmPasswordValid = validateField("confirmPassword", form.confirmPassword);

    if (!isNewPasswordValid || !isConfirmPasswordValid) return;

    setLoading(true);
    dispatch(resetPassword({ email, newPassword: form.newPassword, confirmPassword: form.confirmPassword }))
      .then((result) => {
        if (resetPassword.fulfilled.match(result)) {
          toast.success("Password reset successful");
          navigate("/login");
        } else {
          toast.error(result.payload?.message || "Failed to reset password");
        }
      })
      .catch((err) => {
        console.error("Reset password error:", err);
        toast.error("Unexpected error occurred");
      })
      .finally(() => setLoading(false));
  };

  const isFormValid = !errors.newPassword && !errors.confirmPassword && form.newPassword && form.confirmPassword;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#bdd5fc" }}
    >
      <div
        className="w-full max-w-md bg-white p-8 shadow-xl"
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
          onClick={() => !loading && navigate(-1)}
          className={`mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          <IoIosArrowBack />
        </Button>
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
        <form onSubmit={handleReset} className="space-y-4" noValidate>
          <Input
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            fullWidth
            placeholder='New Password'
            error={errors.newPassword}
            disabled={loading}
            endAdornment={
              <button
                type="button"
                onClick={() => !loading && setShowNewPassword((show) => !show)}
                className={`text-xl ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-black-500 cursor-pointer'}`}
                tabIndex={loading ? -1 : 0}
                disabled={loading}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            }
          />
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
            placeholder='Confirm Password'
            error={errors.confirmPassword}
            disabled={loading}
            endAdornment={
              <button
                type="button"
                onClick={() => !loading && setShowConfirmPassword((show) => !show)}
                className={`text-xl ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-black-500 cursor-pointer'}`}
                tabIndex={loading ? -1 : 0}
                disabled={loading}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            }
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            loaderText="Resetting..."
            disabled={!isFormValid || loading}
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}
