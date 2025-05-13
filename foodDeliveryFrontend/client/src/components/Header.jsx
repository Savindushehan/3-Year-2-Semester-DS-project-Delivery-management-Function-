import { Avatar, Button, Dropdown, Navbar, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { FaMoon, FaSun, FaUtensils } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { signOutSuccess } from "../redux/user/userSlice";
import { authService } from "../service/authService";
import CartIndicator from "./cart/CartIndicator";

export default function Header() {
  const dispatch = useDispatch();
  const path = useLocation().pathname;
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  
  const handleSignout = async () => {
    try {
      const response = await authService.logout(currentUser.token);
      if (response.status === 200) {
        dispatch(signOutSuccess());
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  return (
    <Navbar className="border-b-2 dark:border-gray-700">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white flex items-center"
      >
        <MdDeliveryDining className="text-3xl mr-1 text-orange-500" />
        <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 rounded-lg text-white font-bold">
          Flavour
        </span>
        <span className="font-bold text-orange-500 dark:text-orange-400 ml-1">Fleet</span>
      </Link>
      
      
      <Button className="w-12 h-10 lg:hidden" color="gray" pill>
        <AiOutlineSearch />
      </Button>
      
      <div className="flex gap-2 md:order-2">
        {/* Add CartIndicator here, before theme toggle button */}
        <CartIndicator />
        
        <Button
          className="w-12 h-10 hidden sm:inline"
          color={theme === "light" ? "gray" : "light"}
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
        </Button>
        
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar size="sm" img={currentUser.profilePicture} rounded />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">@{currentUser.username}</span>
              <span className="block text-sm font-medium truncate">
                {currentUser.email}
              </span>
            </Dropdown.Header>
            <Dropdown.Header>
              <Link to={"/dashboard?tab=profile"}>
                <Dropdown.Item>Profile</Dropdown.Item>
              </Link>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
            </Dropdown.Header>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="redToYellow" outline>
              Sign In
            </Button>
          </Link>
        )}
        
        <Navbar.Toggle />
      </div>
      
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link to="/">Home</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/restaurants"} as={"div"}>
          <Link to="/restaurants">Restaurants</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link to="/about">About</Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/contact-us"} as={"div"}>
          <Link to="/contact-us">Contact Us</Link>
        </Navbar.Link>
      
      </Navbar.Collapse>
    </Navbar>
  );
}