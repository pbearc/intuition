import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChatAlt2Icon,
  BookOpenIcon,
  ArchiveIcon,
  CogIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LightningBoltIcon,
  UserGroupIcon,
  ChartBarIcon,
} from "@heroicons/react/outline";
import msdLogo from "../../assets/msd-logo.png";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    // { name: "Engage", href: "/engage", icon: LightningBoltIcon },
    { name: "AI Assistant", href: "/assistant", icon: ChatAlt2Icon },
    { name: "Knowledge Hub", href: "/knowledge", icon: BookOpenIcon },
    {
      name: "Employee Engagement",
      href: "/employee-engagement",
      icon: UserGroupIcon,
    },
    { name: "Past Campaigns", href: "/campaigns", icon: ArchiveIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
  ];

  return (
    <div
      className={`relative h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src={msdLogo} alt="MSD Logo" className="h-8" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      <div className="px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-gray-100 text-primary-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} ${
                    isActive ? "text-primary-600" : "text-gray-500"
                  }`}
                />
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {!isCollapsed && <div className="absolute bottom-0 w-full p-4"></div>}
    </div>
  );
};

export default Sidebar;
