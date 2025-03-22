import React, { useState } from "react";
import { SearchIcon, FilterIcon, BookmarkIcon } from "@heroicons/react/outline";

const KnowledgeHub = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Resources" },
    { id: "frameworks", name: "Frameworks" },
    { id: "templates", name: "Templates" },
    { id: "guides", name: "Guides & Tutorials" },
    { id: "case-studies", name: "Case Studies" },
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

  const filteredResources =
    activeCategory === "all"
      ? resources
      : resources.filter((resource) => resource.category === activeCategory);

  return (
    <div className="h-full">
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
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  ? "border-blue-500 text-blue-600"
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
            className="bg-white rounded-lg shadow overflow-hidden"
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
                      ? "bg-blue-100 text-blue-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {resource.category.charAt(0).toUpperCase() +
                    resource.category.slice(1)}
                </span>
                <button className="text-gray-400 hover:text-blue-500">
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

                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Resource
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeHub;
