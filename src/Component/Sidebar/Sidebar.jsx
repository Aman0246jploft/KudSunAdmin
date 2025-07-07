import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineTeam,
  AiOutlineBell,
  AiOutlineSetting,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineShop,
  AiOutlineTag,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { MdOutlineIndeterminateCheckBox } from "react-icons/md";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import clsx from "clsx";
import logo from './logo.png'

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: AiOutlineDashboard },
    { name: "Users", href: "/user", icon: AiOutlineTeam },
    {
      name: "Items",
      icon: AiOutlineShop,
      isParent: true,
      children: [
        { name: "Products", href: "/sellProduct", icon: AiOutlineTag },
        { name: "Auctions", href: "/auctionProduct", icon: AiOutlineBell },
      ],
    },

    {
      name: "Cms Management",
      icon: AiOutlineShop,
      isParent: true,
      children: [
        {
          name: "Rules",
          href: "/Setting",
          icon: MdOutlineIndeterminateCheckBox,
        },
        { name: "FAQ", href: "/faq", icon: AiOutlineQuestionCircle },
        { name: "ContactUs", href: "/contact_us", icon: AiOutlineQuestionCircle },
        // { name: "Into Video", href: "/StaticSettings", icon: AiOutlineQuestionCircle },
      ],
    },

    {
      name: "Setting",
      icon: AiOutlineSetting,
      isParent: true,
      children: [
        { name: "FeeSetting", href: "/feeSetting", icon: AiOutlineQuestionCircle },
        { name: "Bank", href: "/bank", icon: AiOutlineQuestionCircle },
        { name: "LocationSetting", href: "/location", icon: AiOutlineQuestionCircle },

      ],
    },

    { name: "Category", href: "/category", icon: AiOutlineTag },
  ];

  const toggleExpanded = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const isChildActive = (children) => {
    return children.some((child) => location.pathname === child.href);
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const isExpanded = expandedItems[item.name];
    const hasActiveChild = item.children && isChildActive(item.children);

    if (item.isParent) {
      return (
        <li key={item.name} className="relative">
          {/* Parent Item */}
          <div
            className={clsx(
              "group flex items-center px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer relative",
              !isOpen && "md:justify-center md:px-2"
            )}
            style={{
              backgroundColor: hasActiveChild
                ? theme.colors.sidebarActive
                : undefined,
              color: theme.colors.textPrimary,
            }}
            onMouseEnter={(e) => {
              if (!hasActiveChild)
                e.currentTarget.style.backgroundColor =
                  theme.colors.sidebarHover;
            }}
            onMouseLeave={(e) => {
              if (!hasActiveChild) e.currentTarget.style.backgroundColor = "";
            }}
            onClick={() => {
              if (isOpen || window.innerWidth < 768) {
                toggleExpanded(item.name);
              }
            }}
            title={!isOpen ? item.name : ""}
          >
            <Icon className="w-6 h-6 flex-shrink-0" />

            {/* Parent label - always show on mobile, conditionally on desktop */}
            <span
              className={clsx(
                "ml-3 font-medium text-sm overflow-hidden whitespace-nowrap flex-1",
                !isOpen && "md:hidden"
              )}
            >
              {item.name}
            </span>

            {/* Expand/Collapse Icon */}
            <div
              className={clsx(
                "ml-2 transition-transform duration-200",
                !isOpen && "md:hidden",
                isExpanded && "rotate-180"
              )}
            >
              <AiOutlineDown className="w-4 h-4" />
            </div>

            {/* Tooltip for collapsed state - only on desktop */}
            {!isOpen && (
              <div
                className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                  pointer-events-none whitespace-nowrap z-50 hidden md:block"
              >
                {item.name}
                <div className="mt-1 text-xs opacity-75">
                  {item.children.map((child) => child.name).join(", ")}
                </div>
              </div>
            )}
          </div>

          {/* Sub Items */}
          <div
            className={clsx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              !isOpen && "md:hidden", // Hide sub-items when sidebar is collapsed on desktop
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <ul className="mt-1 space-y-1">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActiveItem = location.pathname === child.href;

                return (
                  <li key={child.name}>
                    <NavLink
                      to={child.href}
                      className={clsx(
                        "group flex items-center px-3 py-2 ml-6 rounded-lg transition-all duration-200 relative"
                      )}
                      style={{
                        backgroundColor: isChildActiveItem
                          ? theme.colors.sidebarActive
                          : undefined,
                        color: theme.colors.textPrimary,
                      }}
                      onMouseEnter={(e) => {
                        if (!isChildActiveItem)
                          e.currentTarget.style.backgroundColor =
                            theme.colors.sidebarHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isChildActiveItem)
                          e.currentTarget.style.backgroundColor = "";
                      }}
                      onClick={() => {
                        // Close sidebar on mobile when a link is clicked
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <ChildIcon className="w-5 h-5 flex-shrink-0 opacity-70" />
                      <span className="ml-3 font-medium text-sm">
                        {child.name}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </li>
      );
    }

    // Regular menu item (non-parent)
    return (
      <li
        key={item.name}
        className="relative"
        style={{
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <NavLink
          to={item.href}
          className={clsx(
            "group flex items-center px-3 py-3 rounded-xl transition-all duration-200 relative",
            !isOpen && "md:justify-center md:px-2"
          )}
          style={{
            backgroundColor: isActive ? theme.colors.sidebarActive : undefined,
            color: theme.colors.textPrimary,
          }}
          onMouseEnter={(e) => {
            if (!isActive)
              e.currentTarget.style.backgroundColor = theme.colors.sidebarHover;
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.backgroundColor = "";
          }}
          title={!isOpen ? item.name : ""}
          onClick={() => {
            // Close sidebar on mobile when a link is clicked
            if (window.innerWidth < 768) {
              toggleSidebar();
            }
          }}
        >
          <Icon className="w-6 h-6 flex-shrink-0" />
          {/* Always show text on mobile, conditionally on desktop */}
          <span
            className={clsx(
              "ml-3 font-medium text-sm overflow-hidden whitespace-nowrap",
              !isOpen && "md:hidden"
            )}
          >
            {item.name}
          </span>

          {/* Tooltip for collapsed state - only on desktop */}
          {!isOpen && (
            <div
              className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-sm 
                opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                pointer-events-none whitespace-nowrap z-50 hidden md:block"
            >
              {item.name}
            </div>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
        className={clsx(
          "fixed left-0 top-0 h-full border-r z-40 transition-all duration-300 ease-in-out",
          // Desktop behavior
          "md:translate-x-0",
          isOpen ? "md:w-64" : "md:w-16",
          // Mobile behavior - REMOVED THE CONFLICTING w-64 md:w-auto
          isOpen ? "w-64" : "w-16", // Use consistent width classes
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.borderLight,
          }}
          className={clsx(
            "absolute -right-3 top-8 border-2 rounded-full p-1.5 transition-all duration-200 hover:scale-110",
            !isOpen && "md:rotate-180",
            // Hide toggle button on mobile when sidebar is closed
            "hidden md:block",
            isOpen && "md:block"
          )}
        >
          {isOpen ? (
            <AiOutlineLeft
              className="w-4 h-4 transition-transform duration-200"
              style={{ color: theme.colors.textPrimary }}
            />
          ) : (
            <AiOutlineRight
              className="w-4 h-4 transition-transform duration-200"
              style={{ color: theme.colors.textPrimary }}
            />
          )}
        </button>

        {/* Logo Section */}
        <div
          className={clsx(
            "flex items-center p-4 border-b transition-all duration-300",
            !isOpen && "md:justify-center md:px-2"
          )}
          style={{
            borderColor: theme.colors.border,
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br  rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <img src={logo} />
          </div>
          {/* Always show text on mobile, conditionally on desktop */}
          <div
            className={clsx(
              "ml-3 overflow-hidden transition-all duration-300",
              !isOpen && "md:hidden md:w-0"
            )}
          >
            <h1
              className="text-xl font-bold transition-colors duration-200"
              style={{ color: theme.colors.textPrimary }}
            >
              Kadsun
            </h1>
            <p
              className="text-xs transition-colors duration-200"
              style={{ color: theme.colors.textSecondary }}
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">{menuItems.map(renderMenuItem)}</ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
