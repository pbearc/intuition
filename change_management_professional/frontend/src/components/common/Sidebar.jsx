import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChatAlt2Icon,
  BookOpenIcon,
  ArchiveIcon,
  CogIcon,
  XIcon,
} from "@heroicons/react/outline";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "AI Assistant", href: "/assistant", icon: ChatAlt2Icon },
    { name: "Knowledge Hub", href: "/knowledge", icon: BookOpenIcon },
    { name: "Past Campaigns", href: "/campaigns", icon: ArchiveIcon },
    { name: "Settings", href: "/settings", icon: CogIcon },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 text-white">
          <div className="flex items-center">
            <span className="text-xl font-bold">Change Management</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white lg:hidden"
          >
            <XIcon className="h-6 w-6" />
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
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:bg-blue-600"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-blue-800 rounded-lg p-3 text-white text-sm">
            <h4 className="font-medium mb-2">Need Help?</h4>
            <p className="text-blue-200 text-xs">
              Contact our support team or check the documentation for guidance.
            </p>
            <button className="mt-3 w-full bg-white text-blue-700 py-1 px-2 rounded text-sm font-medium">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
