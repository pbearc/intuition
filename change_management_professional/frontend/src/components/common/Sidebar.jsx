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
} from "@heroicons/react/outline";
import msdLogo from "../../assets/msd-logo.png";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Engage", href: "/engage", icon: LightningBoltIcon },
    { name: "AI Assistant", href: "/assistant", icon: ChatAlt2Icon },
    { name: "Knowledge Hub", href: "/knowledge", icon: BookOpenIcon },
    { name: "Past Campaigns", href: "/campaigns", icon: ArchiveIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
  ];

  return (
    <div
      className={`relative h-screen bg-primary-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo and Collapse Button */}
      <div className="flex items-center justify-between h-16 px-4 text-white">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src={msdLogo} alt="MSD Logo" className="h-8" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white ${
            isCollapsed ? "mx-auto" : ""
          }`}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6 text-white" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6 text-white" />
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
                    ? "bg-primary-800 text-white"
                    : "text-primary-100 hover:bg-primary-600"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
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
