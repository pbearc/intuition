import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  BookmarkIcon,
  UserIcon,
} from "@heroicons/react/outline";

const KnowledgeHub = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const categories = [
    { id: "all", name: "All Resources" },
    { id: "frameworks", name: "Frameworks" },
    { id: "templates", name: "Templates" },
    { id: "guides", name: "Guides & Tutorials" },
    { id: "case-studies", name: "Case Studies" },
    { id: "past-campaigns", name: "Past Campaigns" },
  ];

  const resources = [
    {
      id: 1,
      title: "ADKAR Change Management Model",
      description:
        "Comprehensive guide to the ADKAR model for individual and organizational change.",
      category: "frameworks",
      tags: ["ADKAR", "Framework", "Core"],
      popularity: 98,
    },
    {
      id: 2,
      title: "Kotter's 8-Step Process for Leading Change",
      description:
        "Explanation of John Kotter's methodology for implementing change.",
      category: "frameworks",
      tags: ["Kotter", "Framework", "Leadership"],
      popularity: 92,
    },
    {
      id: 3,
      title: "Stakeholder Analysis Template",
      description:
        "Template for identifying and analyzing key stakeholders and their concerns.",
      category: "templates",
      tags: ["Stakeholders", "Analysis", "Template"],
      popularity: 85,
    },
    {
      id: 4,
      title: "Communication Planning Guide",
      description:
        "Step-by-step guide for creating effective change communication plans.",
      category: "guides",
      tags: ["Communication", "Planning", "Guide"],
      popularity: 87,
    },
    {
      id: 5,
      title: "Global Tech Company Restructuring",
      description:
        "Case study of successful organizational restructuring at a major tech company.",
      category: "case-studies",
      tags: ["Restructuring", "Case Study", "Success"],
      popularity: 78,
    },
    {
      id: 6,
      title: "Managing Resistance to Change",
      description:
        "Strategies for identifying and addressing resistance during change initiatives.",
      category: "guides",
      tags: ["Resistance", "Strategy", "Management"],
      popularity: 91,
    },
  ];

  // Completed campaigns data from the PastCampaigns component
  const pastCampaigns = [
    {
      id: 1,
      title: "AI-Powered Drug Discovery Platform",
      description:
        "Implementation of machine learning tools to accelerate compound screening and drug discovery process",
      category: "past-campaigns",
      tags: ["AI", "ML", "Drug Discovery", "Agile"],
      popularity: 92,
      team: ["Dr. Rachel Chen", "Michael Torres", "Samantha Lee"],
      feedback: [
        {
          id: 1,
          user: "Alex Johnson",
          role: "Research Scientist",
          comment:
            "The new AI platform has cut our screening time by 60%. Impressive results!",
          rating: 5,
        },
        {
          id: 2,
          user: "Maria Rodriguez",
          role: "Lab Technician",
          comment:
            "Training was well-paced and comprehensive. The transition was smoother than expected.",
          rating: 4,
        },
        {
          id: 3,
          user: "James Wilson",
          role: "Senior Researcher",
          comment:
            "Some initial challenges with data integration, but once resolved, the system has been revolutionary for our workflow.",
          rating: 4,
        },
      ],
    },
    {
      id: 2,
      title: "Enterprise-wide Data Integration",
      description:
        "Integration of clinical, research, and manufacturing data systems for improved analytics",
      category: "past-campaigns",
      tags: ["Data Integration", "Analytics", "ADKAR"],
      popularity: 88,
      team: ["David Wilson", "Lisa Patel", "Thomas Rodriguez"],
      feedback: [
        {
          id: 1,
          user: "Susan Miller",
          role: "Clinical Data Manager",
          comment:
            "Having all our data in one place has transformed how we approach analytics. Great implementation!",
          rating: 5,
        },
        {
          id: 2,
          user: "Robert Chen",
          role: "Manufacturing Lead",
          comment:
            "The transition period was challenging, but the support team was responsive and helpful.",
          rating: 4,
        },
        {
          id: 3,
          user: "Emily Taylor",
          role: "Research Director",
          comment:
            "Would have preferred more customization options for department-specific needs, but overall a significant improvement.",
          rating: 3,
        },
      ],
    },
  ];

  // Combine resources and past campaigns
  const allResources = [...resources, ...pastCampaigns];

  const filteredResources =
    activeCategory === "all"
      ? allResources
      : allResources.filter((resource) => resource.category === activeCategory);

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
  };

  return (
    <div className="h-full relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Knowledge Hub</h1>
        <p className="text-gray-600">
          Access the change management knowledge base and resources
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
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <FilterIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filter
          </button>

          <button className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <span>Sort by: Popular</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex overflow-x-auto py-2 space-x-6">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`whitespace-nowrap pb-2 text-sm font-medium border-b-2 ${
                activeCategory === category.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Resources grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className={`bg-white rounded-lg shadow overflow-hidden ${
              resource.category === "past-campaigns" ? "cursor-pointer" : ""
            }`}
            onClick={() =>
              resource.category === "past-campaigns"
                ? handleCampaignClick(resource)
                : null
            }
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    resource.category === "frameworks"
                      ? "bg-purple-100 text-purple-800"
                      : resource.category === "templates"
                      ? "bg-green-100 text-green-800"
                      : resource.category === "guides"
                      ? "bg-primary-100 text-primary-800"
                      : resource.category === "case-studies"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {resource.category === "past-campaigns"
                    ? "Past Campaign"
                    : resource.category.charAt(0).toUpperCase() +
                      resource.category.slice(1)}
                </span>
                <button className="text-gray-400 hover:text-primary-500">
                  <BookmarkIcon className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium text-gray-700">
                    {resource.popularity}%
                  </span>
                  <span className="ml-1">found helpful</span>
                </div>

                {resource.category === "past-campaigns" ? (
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Feedback
                  </button>
                ) : (
                  <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View Resource
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Feedback Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedCampaign.title}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  {selectedCampaign.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCampaign.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Implementation Team:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCampaign.team.map((member, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                      >
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Employee Feedback
              </h3>
              <div className="space-y-4">
                {selectedCampaign.feedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start mb-2">
                      <div className="bg-primary-100 text-primary-800 rounded-full p-2 mr-3">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {feedback.user}
                        </p>
                        <p className="text-sm text-gray-500">{feedback.role}</p>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < feedback.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{feedback.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeHub;
