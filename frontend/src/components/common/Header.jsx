import React from "react";
import {
  MenuIcon,
  BellIcon,
  SearchIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded-md lg:hidden"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <h1 className="ml-2 text-xl font-bold text-blue-600 lg:ml-0">
            Change AI Assistant
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded-md relative">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="border-l pl-4 border-gray-300">
            <button className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
              <UserCircleIcon className="h-8 w-8 text-gray-500" />
              <span className="ml-2 font-medium text-gray-700 hidden md:block">
                Admin User
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
