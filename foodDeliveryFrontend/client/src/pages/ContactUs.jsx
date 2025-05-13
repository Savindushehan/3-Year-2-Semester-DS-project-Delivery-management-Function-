import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiCheck } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useSelector } from "react-redux";
import { MdDeliveryDining } from "react-icons/md";

export default function ContactUs() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const defaultUserId = currentUser ? currentUser._id : "UnregisteredUser";
  const [formData, setFormData] = useState({
    userid: defaultUserId,
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message ||
      !formData.userid
    ) {
      toast.error("Please fill out all the fields");
      return;
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("api/inquiry/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      setLoading(false);
      setSuccessMessage("Your message has been sent successfully!");
      setFormData({});
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later");
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="min-h-screen mt-20 bg-gray-50 dark:bg-gray-900">
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
              Have a question or feedback about our food delivery service? Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
          {/*right*/}
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="Your Name" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  type="text"
                  placeholder="Name"
                  id="name"
                  value={formData.name || ""}
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
                <Label value="Your Phone Number" className="text-gray-700 dark:text-gray-300" />
                <TextInput
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  id="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <Label value="Your Message" className="text-gray-700 dark:text-gray-300" />
                <Textarea
                  placeholder="How can we help you?"
                  id="message"
                  value={formData.message || ""}
                  onChange={handleChange}
                  className="dark:bg-gray-700 dark:border-gray-600"
                  rows={4}
                />
              </div>
              <Button
                gradientDuoTone="redToYellow"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span className="pl-3">Sending...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
            {successMessage && (
              <Alert color="success" className="mt-5">
                <div className="flex items-center">
                  <HiCheck className="mr-2 text-green-500 text-xl" />
                  {successMessage}
                </div>
              </Alert>
            )}
            {errorMessage && (
              <Alert color="failure" className="mt-5">
                {errorMessage}
              </Alert>
            )}
            <div className="flex gap-2 text-sm mt-5 text-gray-700 dark:text-gray-300">
              <span>More Questions?</span>
              <Link to="/faq" className="text-orange-500 dark:text-orange-400 hover:underline">
                Visit our FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}