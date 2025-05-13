import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { authService } from "../service/authService";
import OAuth from "../components/OAuth";
import { MdDeliveryDining } from "react-icons/md";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber
    ) {
      toast.error("Please fill out all required fields");
      return;
    }
    
    // Password validation
    if (formData.password.length < 8 || formData.password.length > 20) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Check if password contains personal information
    const lowerPassword = formData.password.toLowerCase();
    if (
      (formData.firstName && lowerPassword.includes(formData.firstName.toLowerCase())) ||
      (formData.lastName && lowerPassword.includes(formData.lastName.toLowerCase())) ||
      (formData.email && lowerPassword.includes(formData.email.split('@')[0].toLowerCase()))
    ) {
      toast.error("Password should not contain your personal information");
      return;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await authService.register(formData);
      const data = await res.json();
      if (res.status === 400) {
        toast.error(data.message || "Bad Request");
        setLoading(false);
        return;
      }
      setLoading(false);
      toast.success("Sign Up Successful! Please check your email to verify your account.");
      setFormData({});
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900">
      <ToastContainer />
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/*left*/}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl flex items-center">
            <MdDeliveryDining className="text-5xl mr-1 text-orange-500" />
            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-lg text-white font-bold">
              Flavour
            </span>
            <span className="font-bold text-orange-500 dark:text-orange-400 ml-1">Fleet</span>
          </Link>
          <p className="text-sm mt-5 text-gray-600 dark:text-gray-400">
            Join Flavour Fleet today to order delicious meals from your favorite local restaurants and enjoy fast, reliable delivery right to your door.
          </p>
        </div>
        {/*right*/}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Two-column layout for form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <Label value="Your Username" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="text"
                    placeholder="Username"
                    id="username"
                    value={formData.username || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label value="Your Email" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="email"
                    placeholder="name@company.com"
                    id="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label value="Your Password" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="password"
                    placeholder="***********"
                    id="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be 8-20 characters and not contain personal information
                  </p>
                </div>
                
                <div>
                  <Label value="Confirm Password" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="password"
                    placeholder="***********"
                    id="confirmPassword"
                    value={formData.confirmPassword || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <Label value="First Name" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="text"
                    placeholder="John"
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label value="Last Name" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="text"
                    placeholder="Doe"
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label value="Phone Number" className="text-gray-700 dark:text-gray-300" />
                  <TextInput
                    type="tel"
                    placeholder="1234567890"
                    id="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please enter a 10-digit phone number</p>
                </div>
              </div>
            </div>
            
            {/* Buttons span full width */}
            <div className="mt-2">
              <Button
                gradientDuoTone="redToYellow"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Loading...</span>
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </div>
            <OAuth />
            
            <div className="flex gap-2 text-sm mt-2 justify-center text-gray-700 dark:text-gray-300">
              <span>Have an account?</span>
              <Link to="/sign-in" className="text-orange-500 dark:text-orange-400 hover:underline">
                Sign In
              </Link>
            </div>
          </form>
          
          {errorMessage && (
            <Alert color="failure" className="mt-5">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}