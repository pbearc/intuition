import React from "react";
import { Link } from "react-router-dom";
import {
  ChatAlt2Icon,
  BookOpenIcon,
  ArchiveIcon,
  LightningBoltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/outline";

const Dashboard = () => {
  const stats = [
    {
      name: "AI Interactions",
      value: "147",
      change: "+12%",
      icon: ChatAlt2Icon,
    },
    {
      name: "Knowledge Articles",
      value: "38",
      change: "+4",
      icon: BookOpenIcon,
    },
    { name: "Change Campaigns", value: "12", change: "+2", icon: ArchiveIcon },
    {
      name: "Average Feedback",
      value: "4.8/5",
      change: "+0.3",
      icon: ChartBarIcon,
    },
  ];

  const recentCampaigns = [
    {
      id: 1,
      name: "ERP System Migration",
      status: "In Progress",
      progress: 65,
      date: "2023-01-15",
    },
    {
      id: 2,
      name: "Remote Work Policy",
      status: "Completed",
      progress: 100,
      date: "2022-11-23",
    },
    {
      id: 3,
      name: "Department Restructuring",
      status: "Planning",
      progress: 25,
      date: "2023-02-10",
    },
  ];

  const quickActions = [
    {
      name: "New Change Initiative",
      description: "Start a new change campaign",
      icon: LightningBoltIcon,
      href: "/assistant",
    },
    {
      name: "Stakeholder Analysis",
      description: "Identify and map key stakeholders",
      icon: UserGroupIcon,
      href: "/assistant?tool=stakeholder",
    },
    {
      name: "Communication Review",
      description: "Analyze and improve communications",
      icon: DocumentTextIcon,
      href: "/assistant?tool=communication",
    },
  ];

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your change management activities
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-4 rounded-lg shadow flex items-center"
          >
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-800">
                  {stat.value}
                </p>
                <span className="ml-2 text-sm text-green-600">
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Quick Actions
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-800">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Change Campaigns
            </h2>
            <Link
              to="/campaigns"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Progress</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {campaign.name}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : campaign.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          {campaign.progress}%
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(campaign.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
