import { Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { authService } from "../service/authService";
import { MdDeliveryDining, MdLockReset } from "react-icons/md";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      if (response.status === 200) {
        toast.success("Password reset link sent to your email");
        setEmail("");
      } else if (response.status === 400) {
        toast.error("Invalid email address");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Invalid email address");
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900">
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
            Enter your email address and we'll send you a link to reset your password. You'll be able to access your account in no time!
          </p>
          
          <div className="mt-6 hidden md:block">
            <img 
              src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1123.jpg" 
              alt="Password Reset" 
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
              Reset Your Password
            </h2>
            
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="Your Email" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    <span className="pl-3">Sending...</span>
                  </>
                ) : (
                  "Send Reset Link"
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