import React, { useState, useRef, useEffect } from "react";
import {
  AiOutlineBell,
  AiOutlineDown,
  AiOutlineSetting,
  AiOutlineLogout,
  AiOutlineProfile,
  AiOutlineQuestionCircle,
  AiOutlineMenu,
} from "react-icons/ai";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import Image from "../Atoms/Image/Image";
import { useNavigate } from "react-router-dom";

import { getLoginProfile } from "../../features/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";

const Header = ({ toggleSidebar, isMobile }) => {
  const dispatch = useDispatch()
  const { currentTheme, changeTheme, theme } = useTheme();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileDropdownRef = useRef(null);
  const selector = useSelector(state => state?.user?.getLoginProfiledata)
  useEffect(() => {
    dispatch(getLoginProfile())
  }, [localStorage.getItem("kadSunInfo")])

  let userInfo = JSON.parse(localStorage.getItem("kadSunInfo"));

  const navigate = useNavigate();

  const themeDropdownRef = useRef(null);

  // Theme options with their display info
  const themeOptions = [
    {
      key: "light",
      name: "Light",
      icon: "🌞",
      description: "Clean and bright",
    },
    {
      key: "dark",
      name: "Dark",
      icon: "🌙",
      description: "Easy on the eyes",
    },
    {
      key: "red",
      name: "Red",
      icon: "🔴",
      description: "Bold and vibrant",
    },
    {
      key: "green",
      name: "Green",
      icon: "🟢",
      description: "Fresh and natural",
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(event.target)
      ) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
    setShowThemeDropdown(false);
  };

  const getCurrentThemeInfo = () => {
    return (
      themeOptions.find((option) => option.key === currentTheme) ||
      themeOptions[0]
    );
  };

  const profileMenuItems = [
    {
      icon: AiOutlineProfile,
      label: "View Profile",
      onClick: () => {
        navigate('/profilePage')
        setShowProfileDropdown(false);
      },
    },
    {
      icon: AiOutlineLogout,
      label: "Log Out",
      onClick: () => {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (confirmed) {
          localStorage.removeItem("kadSunInfo");
          navigate("/login");
        }
        setShowProfileDropdown(false);
      },
      isDestructive: true,
    }

  ];

  return (
    <header
      className="shadow-sm border-b px-4 md:px-6 py-2 relative"
      style={{
        backgroundColor: theme.colors.headerBg,
        borderColor: theme.colors.headerBorder,
        color: theme.colors.headerText,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg transition-colors duration-200 md:hidden"
              style={{
                backgroundColor: theme.colors.buttonSecondary,
                color: theme.colors.buttonTextOnSecondary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.buttonSecondaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  theme.colors.buttonSecondary;
              }}
            >
              <AiOutlineMenu className="w-5 h-5" />
            </button>
          )}

          {/* Title */}
          <div>
            <h1
              className="text-lg md:text-xl font-bold"
              style={{ color: theme.colors.textPrimary }}
            >
              Welcome back!
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Dropdown */}
          {/* <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: showThemeDropdown
                  ? theme.colors.buttonSecondaryHover
                  : theme.colors.buttonSecondary,
                color: theme.colors.buttonTextOnSecondary,
              }}
              onMouseEnter={(e) => {
                if (!showThemeDropdown) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.buttonSecondaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!showThemeDropdown) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.buttonSecondary;
                }
              }}
            >
              <span className="text-lg">{getCurrentThemeInfo().icon}</span>
              <span className="hidden sm:block text-sm font-medium">
                {getCurrentThemeInfo().name}
              </span>
              <AiOutlineDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showThemeDropdown ? "rotate-180" : ""
                }`}
              />
            </button>


            {showThemeDropdown && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                  boxShadow: theme.shadows.lg,
                }}
              >
                <div className="py-1">
                  {themeOptions.map((themeOption) => (
                    <button
                      key={themeOption.key}
                      onClick={() => handleThemeChange(themeOption.key)}
                      className="flex items-center space-x-3 w-full px-4 py-1.5 text-left transition-colors duration-200"
                      style={{
                        backgroundColor:
                          currentTheme === themeOption.key
                            ? theme.colors.secondary
                            : "transparent",
                        color: theme.colors.textPrimary,
                      }}
                      onMouseEnter={(e) => {
                        if (currentTheme !== themeOption.key) {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentTheme !== themeOption.key) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <span className="text-lg">{themeOption.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {themeOption.name}
                          </span>
                          {currentTheme === themeOption.key && (
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: theme.colors.success,
                                color: "#ffffff",
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs mt-1"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {themeOption.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div> */}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200"
              style={{
                backgroundColor: showProfileDropdown
                  ? theme.colors.buttonSecondaryHover
                  : theme.colors.buttonSecondary,
                color: theme.colors.buttonTextOnSecondary,
              }}
              onMouseEnter={(e) => {
                if (!showProfileDropdown) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.buttonSecondaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!showProfileDropdown) {
                  e.currentTarget.style.backgroundColor =
                    theme.colors.buttonSecondary;
                }
              }}
            >
              <Image
                src={selector?.profileImage}
                alt="Profile"
                width={32}
                height={32}
                rounded={true}
                className="w-8 h-8"
              />
              <span className="hidden md:block font-medium">
                {selector?.userName}
              </span>
              <AiOutlineDown
                className={`w-4 h-4 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50"
                style={{
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                  boxShadow: theme.shadows.lg,
                }}
              >
                {/* User Info Section */}
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: theme.colors.border }}
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={selector?.profileImage}
                      alt="Profile"
                      width={40}
                      height={40}
                      rounded={true}
                      className="w-10 h-10"
                    />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: theme.colors.textPrimary }}
                      >
                        {selector?.userName}
                      </p>
                      {/* <p
                        className="text-sm"
                        style={{
                          color: theme.colors.textSecondary,
                          maxWidth: "140px", // limit max width as per your dropdown size
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={selector?.email} // show full email on hover
                      >
                        {selector?.email}
                      </p> */}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {profileMenuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-left transition-colors duration-200"
                        style={{
                          color: item.isDestructive
                            ? theme.colors.error
                            : theme.colors.textPrimary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            theme.colors.secondary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
