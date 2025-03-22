import React, { useState } from "react";
import {
  UserIcon,
  BellIcon,
  LockClosedIcon,
  CogIcon,
  DatabaseIcon,
} from "@heroicons/react/outline";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      name: "Profile Settings",
      icon: UserIcon,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: BellIcon,
    },
    {
      id: "security",
      name: "Security",
      icon: LockClosedIcon,
    },
    {
      id: "ai",
      name: "AI Preferences",
      icon: CogIcon,
    },
    {
      id: "data",
      name: "Data Management",
      icon: DatabaseIcon,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings />;
      case "ai":
        return <AISettings />;
      case "data":
        return <DataSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-56 bg-white rounded-lg shadow">
          <nav className="p-4">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Profile Settings
      </h2>

      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-2xl font-bold">
            AU
          </div>
          <div className="ml-5">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
              Change Photo
            </button>
            <button className="ml-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              Remove
            </button>
          </div>
        </div>
      </div>

      <form className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              defaultValue="Admin"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              defaultValue="User"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue="admin@example.com"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue="change_manager"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="change_manager">Change Manager</option>
            <option value="project_lead">Project Lead</option>
            <option value="executive">Executive</option>
            <option value="team_member">Team Member</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            defaultValue="Change management professional with expertise in organizational transformation and leadership development."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationSettings = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Notification Settings
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Email Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Change Campaign Updates
                </p>
                <p className="text-sm text-gray-500">
                  Receive updates about ongoing change campaigns
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Task Updates
                </p>
                <p className="text-sm text-gray-500">
                  Notify about updates to tasks you're involved in
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 mr-3"
          >
            Reset to Default
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Security Settings
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Change Password
          </h3>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Two-Factor Authentication
          </h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Enable Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Session Management
          </h3>
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-800">
                Active Sessions
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Current Session
                    </p>
                    <p className="text-xs text-gray-500">
                      Windows 11 · Chrome · New York, USA
                    </p>
                    <p className="text-xs text-green-600">Active now</p>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-800 py-1 px-2 rounded-full">
                    Current
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Mobile App
                    </p>
                    <p className="text-xs text-gray-500">
                      iOS 16 · Safari · New York, USA
                    </p>
                    <p className="text-xs text-gray-500">
                      Last active: 2 hours ago
                    </p>
                  </div>
                  <button className="text-xs text-red-600 hover:text-red-800">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AISettings = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        AI Preferences
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Change Management Framework
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Select your preferred change management framework for AI
            recommendations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4 hover:border-primary-500 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="adkar"
                  name="framework"
                  value="adkar"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="adkar"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  ADKAR Model
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 ml-7">
                Awareness, Desire, Knowledge, Ability, Reinforcement
              </p>
            </div>

            <div className="border border-gray-200 rounded-md p-4 hover:border-primary-500 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="kotter"
                  name="framework"
                  value="kotter"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="kotter"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Kotter's 8-Step Model
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 ml-7">
                Eight-step process for leading change
              </p>
            </div>

            <div className="border border-gray-200 rounded-md p-4 hover:border-primary-500 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="lewin"
                  name="framework"
                  value="lewin"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="lewin"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Lewin's Change Model
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 ml-7">
                Unfreeze, Change, Refreeze
              </p>
            </div>

            <div className="border border-gray-200 rounded-md p-4 hover:border-primary-500 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="bridge"
                  name="framework"
                  value="bridge"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="bridge"
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Bridges' Transition Model
                </label>
              </div>
              <p className="mt-2 text-xs text-gray-500 ml-7">
                Ending, Neutral Zone, New Beginning
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            AI Assistant Behavior
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Proactive Suggestions
                </p>
                <p className="text-sm text-gray-500">
                  Allow AI to make proactive suggestions based on your
                  activities
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Learning from Feedback
                </p>
                <p className="text-sm text-gray-500">
                  Allow AI to learn from your feedback to improve
                  recommendations
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Content Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="detailLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Detail Level
              </label>
              <select
                id="detailLevel"
                name="detailLevel"
                defaultValue="balanced"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="concise">Concise</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Primary Language
              </label>
              <select
                id="language"
                name="language"
                defaultValue="en"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 mr-3"
          >
            Reset to Default
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

const DataSettings = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Data Management
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Data Storage
          </h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Storage Usage
                </p>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  2.3 GB of 5 GB used
                </p>
              </div>
              <button className="text-sm text-primary-600 hover:text-primary-800">
                Upgrade Storage
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Export Data
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Download your data in various formats for backup or analysis
          </p>
          <div className="space-y-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Export Change Campaign Data (CSV)
            </button>
            <button className="block inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Export AI Interaction History (JSON)
            </button>
            <button className="block inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Export User Feedback Data (CSV)
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3">
            Data Retention
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  AI Conversation History
                </p>
                <p className="text-sm text-gray-500">
                  How long to keep your conversation history with the AI
                </p>
              </div>
              <select
                className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue="90days"
              >
                <option value="30days">30 days</option>
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="forever">Forever</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Completed Campaign Data
                </p>
                <p className="text-sm text-gray-500">
                  How long to keep data from completed change campaigns
                </p>
              </div>
              <select
                className="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                defaultValue="1year"
              >
                <option value="90days">90 days</option>
                <option value="1year">1 year</option>
                <option value="3years">3 years</option>
                <option value="forever">Forever</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-700 mb-3 text-red-600">
            Danger Zone
          </h3>
          <div className="border border-red-200 rounded-md p-4 bg-red-50">
            <p className="text-sm text-gray-800 mb-3">
              These actions cannot be undone. Please be certain.
            </p>
            <div className="space-y-3">
              <button className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                Clear All AI Conversation History
              </button>
              <button className="block inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                Delete All Campaign Data
              </button>
              <button className="block inline-flex items-center px-4 py-2 bg-red-600 border border-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
