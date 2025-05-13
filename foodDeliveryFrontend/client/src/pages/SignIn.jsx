import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInSuccess,
  signInStart,
  signInFailure,
} from "../redux/user/userSlice";
import { ToastContainer, toast } from "react-toastify";
import OAuth from "../components/OAuth";
import { authService } from "../service/authService";
import { MdDeliveryDining } from "react-icons/md";

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { error: errorMessage } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      dispatch(signInStart());
      const res = await authService.login(formData.email, formData.password);
      const data = await res.json();
      if (res.status === 500) {
        toast.error(data.message || "Internal server error");
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        toast.error(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }
      if(res.status === 403){
        toast.error(data.message || "Please verify your email first");
        setLoading(false);
        return;
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        setFormData({});
        navigate("/");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
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
            Sign in to your account to order delicious food from your favorite restaurants, track your deliveries, and manage your preferences.
          </p>
        </div>
        {/*right*/}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                placeholder="**********"
                id="password"
                value={formData.password || ""}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 dark:text-orange-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              gradientDuoTone="redToYellow"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
            <span>Don't have an account?</span>
            <Link to="/sign-up" className="text-orange-500 dark:text-orange-400 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}