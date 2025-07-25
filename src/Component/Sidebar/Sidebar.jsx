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
import { MdOutlineCategory } from "react-icons/md";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { VscPreview } from "react-icons/vsc";
import { GrTransaction } from "react-icons/gr";
import { MdRateReview } from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { BsBoxSeam } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";
import { MdOutlineIndeterminateCheckBox } from "react-icons/md";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import clsx from "clsx";
import logo from './logo.png'

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: AiOutlineDashboard },

    {
      name: "Users",
      icon: BsBoxSeam,
      isParent: true,
      children: [
        { name: "Account List", href: "/user", icon: AiOutlineTeam },
        { name: "Seller Verification", href: "/seller-verification-requests", icon: RiAuctionLine },
      ],
    },


    {
      name: "Items",
      icon: BsBoxSeam,
      isParent: true,
      children: [
        { name: "Products", href: "/sellProduct", icon: AiOutlineTag },
        { name: "Auctions", href: "/auctionProduct", icon: RiAuctionLine },
        { name: "Thread", href: "/thread", icon: CiViewList },

      ],
    },

    {
      name: "CMS Management",
      icon: AiOutlineShop,
      isParent: true,
      children: [
        { name: "Video Section", href: "/video-section", icon: AiOutlineShop },
        { name: "Terms of Service", href: "/terms-of-service", icon: AiOutlineShop },
        { name: "Privacy Policy", href: "/privacy-policy", icon: AiOutlineShop },
        { name: "Auction Rules", href: "/auction-rules", icon: AiOutlineShop },
        { name: "FAQs", href: "/faq", icon: AiOutlineShop },
        { name: "ContactUs", href: "/contact_us", icon: AiOutlineShop },
      ],
    },

    {
      name: "Settings",
      icon: AiOutlineSetting,
      isParent: true,
      children: [
        { name: "FeeSettings", href: "/feeSetting", icon: AiOutlineSetting },
        { name: "Bank", href: "/bank", icon: AiOutlineSetting },
        { name: "Location Management", href: "/location", icon: AiOutlineSetting },
        { name: "Carrier Management", href: "/carrier", icon: AiOutlineSetting },

      ],
    },

    { name: "Category", href: "/category", icon: MdOutlineCategory },
    // { name: "Chat", href: "/chat", icon: IoChatboxEllipsesOutline },
    { name: "Disputes", href: "/disputeManagement", icon: VscPreview },
    { name: "Transactions", href: "/admin/transactions", icon: GrTransaction },
    { name: "Financial Analytics", href: "/admin/financial-dashboard", icon: AiOutlineDashboard },
    { name: "Review Management", href: "/admin/review-management", icon: MdRateReview },




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

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile) {
      toggleSidebar();
    }
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
              !isOpen && !isMobile && "md:justify-center md:px-2"
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
              if (isOpen || isMobile) {
                toggleExpanded(item.name);
              }
            }}
            title={!isOpen && !isMobile ? item.name : ""}
          >
            <Icon className="w-6 h-6 flex-shrink-0" />

            {/* Parent label - always show on mobile, conditionally on desktop */}
            <span
              className={clsx(
                "ml-3 font-medium text-sm overflow-hidden whitespace-nowrap flex-1",
                !isOpen && !isMobile && "md:hidden"
              )}
            >
              {item.name}
            </span>

            {/* Expand/Collapse Icon */}
            <div
              className={clsx(
                "ml-2 transition-transform duration-200",
                !isOpen && !isMobile && "md:hidden",
                isExpanded && "rotate-180"
              )}
            >
              <AiOutlineDown className="w-4 h-4" />
            </div>

            {/* Tooltip for collapsed state - only on desktop */}
            {!isOpen && !isMobile && (
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
              !isOpen && !isMobile && "md:hidden", // Hide sub-items when sidebar is collapsed on desktop
              isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
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
                      onClick={handleLinkClick}
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
            !isOpen && !isMobile && "md:justify-center md:px-2"
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
          title={!isOpen && !isMobile ? item.name : ""}
          onClick={handleLinkClick}
        >
          <Icon className="w-6 h-6 flex-shrink-0" />
          {/* Always show text on mobile, conditionally on desktop */}
          <span
            className={clsx(
              "ml-3 font-medium text-sm overflow-hidden whitespace-nowrap",
              !isOpen && !isMobile && "md:hidden"
            )}
          >
            {item.name}
          </span>

          {/* Tooltip for collapsed state - only on desktop */}
          {!isOpen && !isMobile && (
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
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      <div
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
        }}
        className={clsx(
          "fixed left-0 top-0 h-full border-r z-40 transition-all duration-300 ease-in-out flex flex-col",
          // Mobile behavior
          isMobile ? [
            "w-64",
            isOpen ? "translate-x-0" : "-translate-x-full"
          ] : [
            // Desktop behavior
            "translate-x-0",
            isOpen ? "w-64" : "w-16"
          ]
        )}
      >
        {/* Toggle Button - Show on desktop, hide on mobile when closed */}
        <button
          onClick={toggleSidebar}
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.borderLight,
          }}
          className={clsx(
            "absolute -right-3 top-8 border-2 rounded-full p-1.5 transition-all duration-200 hover:scale-110",
            isMobile ? "hidden" : "block", // Hide on mobile, show on desktop
            !isOpen && !isMobile && "rotate-180"
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
            "flex items-center p-4 border-b transition-all duration-300 flex-shrink-0",
            !isOpen && !isMobile && "md:justify-center md:px-2"
          )}
          style={{
            borderColor: theme.colors.border,
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <img src={logo} className="w-8 h-8 object-contain" alt="Logo" />
          </div>
          {/* Always show text on mobile, conditionally on desktop */}
          <div
            className={clsx(
              "ml-3 overflow-hidden transition-all duration-300",
              !isOpen && !isMobile && "md:hidden md:w-0"
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
        <nav 
          className="flex-1 py-6 overflow-y-auto min-h-0 scrollbar-thin sidebar-scroll"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.colors.border} transparent`,
          }}
        >
          <ul className="space-y-2 px-3 pb-4">{menuItems.map(renderMenuItem)}</ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
