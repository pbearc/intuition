import React, { useState } from "react";
import ChatInterface from "../components/chat/ChatInterface";
import {
  ChartPieIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EmojiHappyIcon,
} from "@heroicons/react/outline";

const ChangeAssistant = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const tools = [
    {
      id: "scope",
      name: "Scope Analysis",
      description: "Define and analyze the scope of your change initiative",
      icon: ChartPieIcon,
    },
    {
      id: "communication",
      name: "Communication Review",
      description: "Analyze and improve your change communications",
      icon: DocumentTextIcon,
    },
    {
      id: "stakeholder",
      name: "Stakeholder Mapping",
      description: "Identify and analyze key stakeholders",
      icon: UserGroupIcon,
    },
    {
      id: "resistance",
      name: "Resistance Management",
      description: "Strategies to manage emotional responses to change",
      icon: EmojiHappyIcon,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Change Management Assistant
        </h1>
        <p className="text-gray-600">
          Your AI-powered assistant for effective change management
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Chat area */}
        <div className="flex-1">
          <div className="h-full">
            <ChatInterface />
          </div>
        </div>

        {/* Tools sidebar */}
        <div className="w-full lg:w-80 flex flex-col bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Change Management Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools to support your change initiatives
            </p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  className="w-full flex items-start p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
                  onClick={() => {}}
                >
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{tool.name}</h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
              Create Custom Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeAssistant;
