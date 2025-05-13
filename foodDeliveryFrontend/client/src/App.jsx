import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgetPassword";
import Dashboard from "./pages/Dashboard";
import ContactUs from "./pages/ContactUs";
import Header from "./components/Header";
import FooterComp from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import RestaurantDetail from "./pages/RestaurantDetail";
import RegisterDeliveryDriver from "./components/RegisterDeliveryDriver";
import ViewDeliveryDrivers from "./components/ViewDeliveryDrivers";
import DeliveryReplicationView from "./components/DeliveryReplicationView";
import DeliveryAssignOrders from "./components/DriverAssignOrders";
import UpdateOrderPage from "./components/UpdateOrder";
import LocationMap from "./components/LocationMap";
import UserLocationViewer from "./components/UserLocationViewer";
import { CreateUserModal } from "./components/sub-components/user-management/CreateUserModal";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import AllOrders from "./components/AllOrders";
import CustomerTrackingOrder from "./components/CustomerTrackingOrder"; 

import Checkout from "./pages/Checkout";
export default function App() {
  return (
    <CartProvider>
      <CartDrawer />
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/RegisterDeliveryDriver" element={<RegisterDeliveryDriver />} />
        <Route path="/ViewDeliveryDrivers" element={<ViewDeliveryDrivers />} />
        <Route path="/DeliveryReplicationView" element={<DeliveryReplicationView />} />
        <Route path="/DeliveryAssignOrders" element={<DeliveryAssignOrders />} />
        <Route path="/update-order/:orderId" element={<UpdateOrderPage />} />
        <Route path="/location-map/:orderId/:userId" element={<LocationMap />} />
        <Route path="/UserLocationViewer" element={<UserLocationViewer />} />
        <Route path="/CreateUserModal" element={<CreateUserModal />} />
        <Route element={<PrivateRoute/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout/>}/>
        </Route>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/AllOrders" element={<AllOrders />} />
        <Route path="/CustomerTrackingOrder/:userId/:orderId" element={<CustomerTrackingOrder />} /> {/* ✅ Added Route */}

      </Routes>
      <FooterComp/>
    </BrowserRouter>
    </CartProvider>
  );
}
