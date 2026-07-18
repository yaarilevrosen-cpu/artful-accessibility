import { themeChange } from "theme-change";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BellIcon from "@heroicons/react/24/outline/BellIcon";
import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon";
import { useNavigate } from "react-router-dom";
import MoonIcon from "@heroicons/react/24/outline/MoonIcon";
import SunIcon from "@heroicons/react/24/outline/SunIcon";
import { openRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";

function Header() {
  const dispatch = useDispatch();
  const { noOfNotifications, pageTitle } = useSelector((state) => state.header);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"));
  const [username, setUsername] = useState(""); // State to hold username
  const nav = useNavigate();

  useEffect(() => {
    // Initialize themeChange and username on component mount
    themeChange(false);

    // Set theme if not present in localStorage
    if (currentTheme === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setCurrentTheme(prefersDark ? "dark" : "light");
    }

    // Retrieve username from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUsername(parsedUser.username || "User");
    }
  }, [currentTheme]);

  // Handle theme change
  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Open notifications
  const openNotification = () => {
    dispatch(
      openRightDrawer({ header: "Notifications", bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION })
    );
  };

  // Logout function
  const logoutUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    nav("/");
  };

  return (
    <>
      <div className="navbar sticky top-0 bg-base-100 z-10 shadow-md">
        {/* Menu Toggle for Mobile View */}
        <div className="flex-1 flex items-center">
    <label
      htmlFor="left-sidebar-drawer"
      className="btn btn-primary drawer-button bg-blue-500 hover:bg-blue-600 text-black lg:hidden"
    >
      <Bars3Icon className="h-5 w-5" />
    </label>
    <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
  </div>
        {/* Right-Side Elements */}
        <div className="flex-none flex items-center gap-4">
            {/* Light/Dark Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-gray-200 dark:hover:bg-gray-700  transition-colors"
          >
            {currentTheme === "dark" ? (
              <MoonIcon className="h-6 w-6 text-gray-400" />
            ) : (
              <SunIcon className="h-6 w-6 text-yellow-500" />
            )}
          </button>
          {/* Notification Bell */}
         {/*
          <button
            className="btn btn-ghost btn-circle hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={openNotification}
          >
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            {noOfNotifications > 0 && (
              <span className="badge badge-sm badge-primary">{noOfNotifications}</span>
            )}
          </button>*/}

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                {/* Simple User Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="currentColor"
                >
                  <path d="M32 2C15.432 2 2 15.432 2 32s13.432 30 30 30 30-13.432 30-30S48.568 2 32 2zm0 8c6.6 0 12 5.4 12 12s-5.4 12-12 12-12-5.4-12-12 5.4-12 12-12zm0 44c-7.912 0-14.86-4.064-18.967-10.246 1.485-5.682 11.334-8.754 18.967-8.754s17.482 3.072 18.967 8.754C46.86 49.936 39.912 54 32 54z" />
                </svg>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-lg bg-white dark:bg-gray-800 rounded-lg w-40"
            >
              <li>
  {/* Greeting Message */}
  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
    Hello, {username}
  </span>
</li>
<div className="divider my-1"></div>
<li>
  {/* Logout Button */}
  <a
    onClick={logoutUser}
    className="text-red-600 dark:text-red-400 border border-red-600 hover:text-white hover:bg-red-600 dark:hover:bg-red-800 py-2 px-5 rounded-md cursor-pointer transition duration-100 ease-in-out"
  >
    Logout
  </a>
</li>


            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
