import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/outline";

const PastCampaigns = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", name: "All Campaigns" },
    { id: "completed", name: "Completed" },
    { id: "in-progress", name: "In Progress" },
    { id: "planned", name: "Planned" },
  ];

  const campaigns = [
    {
      id: 1,
      name: "AI-Powered Drug Discovery Platform",
      description:
        "Implementation of machine learning tools to accelerate compound screening and drug discovery process",
      status: "Completed",
      startDate: "2023-05-10",
      endDate: "2023-11-15",
      success: 92,
      team: ["Dr. Rachel Chen", "Michael Torres", "Samantha Lee"],
      approach: "Agile",
    },
    {
      id: 2,
      name: "Enterprise-wide Data Integration",
      description:
        "Integration of clinical, research, and manufacturing data systems for improved analytics",
      status: "Completed",
      startDate: "2023-08-01",
      endDate: "2024-02-28",
      success: 88,
      team: ["David Wilson", "Lisa Patel", "Thomas Rodriguez"],
      approach: "ADKAR",
    },
    {
      id: 3,
      name: "Company-wide Internal GPT Adoption",
      description:
        "Training and implementation of proprietary GPT system for research documentation and knowledge management",
      status: "In Progress",
      startDate: "2025-01-15",
      endDate: "2025-06-30",
      success: 65,
      team: ["Karen Williams", "Mark Johnson", "Patricia Nguyen"],
      approach: "Kotter",
    },
    {
      id: 4,
      name: "Hybrid Work Policy Implementation",
      description:
        "Transition to flexible work environment with updated collaboration tools and protocols",
      status: "In Progress",
      startDate: "2024-11-01",
      endDate: "2025-05-15",
      success: 72,
      team: ["Robert Martinez", "Jessica Morgan", "Steven Black"],
      approach: "Lewin",
    },
    {
      id: 5,
      name: "Digital Clinical Trials Platform",
      description:
        "Rollout of new decentralized clinical trial technology with remote monitoring capabilities",
      status: "Planned",
      startDate: "2025-06-01",
      endDate: "2025-12-15",
      success: null,
      team: ["Emma Chen", "Andrew Peters", "Nicole Washington"],
      approach: "PDCA",
    },
    {
      id: 6,
      name: "Laboratory Automation System",
      description:
        "Implementation of robotics and IoT sensors for high-throughput screening and automated data collection",
      status: "Planned",
      startDate: "2025-07-10",
      endDate: "2026-01-31",
      success: null,
      team: ["James Brown", "Sarah Kim", "Daniel Garcia"],
      approach: "Agile",
    },
  ];

  const filteredCampaigns =
    activeTab === "all"
      ? campaigns
      : campaigns.filter((campaign) => {
          const status = campaign.status.toLowerCase().replace(" ", "-");
          return status === activeTab;
        });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Past Change Campaigns
        </h1>
        <p className="text-gray-600">
          Archive of previous technology change management initiatives with
          insights and recommendations
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search campaigns..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FilterIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filter
          </button>

          <button className="ml-3 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
            Add New Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex overflow-x-auto py-2 space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`whitespace-nowrap pb-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Campaign
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timeline
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Success Rate
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Approach
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {campaign.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "In Progress"
                          ? "bg-primary-100 text-primary-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(campaign.startDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {formatDate(campaign.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.success !== null ? (
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${
                              campaign.success >= 80
                                ? "bg-green-600"
                                : campaign.success >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${campaign.success}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {campaign.success}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not started</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.approach}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        className="text-gray-400 hover:text-primary-600"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-green-600"
                        title="Export"
                      >
                        <DocumentDownloadIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-yellow-600"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PastCampaigns;
