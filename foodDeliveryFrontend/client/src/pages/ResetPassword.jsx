import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { authService } from "../service/authService";
import { MdDeliveryDining, MdLockReset } from "react-icons/md";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid reset link");
        setTimeout(() => navigate("/forgot-password"), 3000);
        return;
      }

      try {
        await authService.validateToken(token);
        setValidating(false);
      } catch (error) {
        toast.error("Invalid or expired token");
        setTimeout(() => navigate("/forgot-password"), 3000);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      if (response.status === 200) {
        toast.success("Password reset successfully. Redirecting to sign in...");
        setFormData({ password: "", confirmPassword: "" });
        setTimeout(() => navigate("/sign-in"), 3000);
      } else if (response.status === 400) {
        toast.error("Invalid token or password");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen mt-20 flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" color="warning" />
        <span className="pl-3 text-gray-800 dark:text-gray-200">Validating your link...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20  bg-gray-50 dark:bg-gray-900">
      <ToastContainer />
      <div className="flex p-3 max-w-4xl mx-auto flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl flex items-center">
            <MdDeliveryDining className="text-5xl mr-1 text-orange-500" />
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-lg text-white font-bold">
              Flavour
            </span>
            <span className="font-bold text-orange-500 dark:text-orange-400 ml-1">Fleet</span>
          </Link>
          <p className="text-sm mt-5 text-gray-600 dark:text-gray-400">
            Create a new password for your Flavour Fleet account. Make sure it's secure and easy to remember.
          </p>
          
          <div className="mt-6 hidden md:block">
            <img 
              src="https://img.freepik.com/free-vector/reset-password-concept-illustration_114360-7866.jpg" 
              alt="Reset Password" 
              className="w-full max-w-md rounded-lg shadow-md"
            />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="mb-4 flex justify-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <MdLockReset className="text-4xl text-orange-500 dark:text-orange-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
              Create New Password
            </h2>
            
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="New Password" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be at least 8 characters
                </p>
              </div>
              <div>
                <Label value="Confirm Password" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  type="password"
                  placeholder="••••••••"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <Button
                gradientDuoTone="redToYellow"
                type="submit"
                disabled={loading}
                className="mt-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Resetting...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
            
            <div className="flex gap-2 text-sm mt-5 justify-center text-gray-700 dark:text-gray-300">
              <span>Remember your password?</span>
              <Link to="/sign-in" className="text-orange-500 dark:text-orange-400 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}