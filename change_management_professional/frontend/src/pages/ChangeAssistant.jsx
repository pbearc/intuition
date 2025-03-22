import React, { useState, useRef } from "react";
import ChatInterface from "../components/chat/ChatInterface";
import {
  ChartPieIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EmojiHappyIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  LightningBoltIcon,
} from "@heroicons/react/outline";

const ChangeAssistant = () => {
  const [activeToolId, setActiveToolId] = useState(null);
  const chatInterfaceRef = useRef(null);

  const tools = [
    {
      id: "change-initiative",
      name: "New Change Initiative",
      description: "Register a new technology change for your organization",
      icon: LightningBoltIcon,
      prompt:
        "I'm now in Technology Change Agent mode. Please provide the name of the new technology:",
    },
    {
      id: "scope",
      name: "Scope Analysis",
      description: "Define and analyze the scope of your change initiative",
      icon: ChartPieIcon,
      prompt:
        "I'm now in Scope Analysis mode. I'll help you define and analyze the scope of your change initiative.",
    },
    {
      id: "communication",
      name: "Communication Review",
      description: "Analyze and improve your change communications",
      icon: DocumentTextIcon,
      prompt:
        "I'm now in Communication Review mode. I'll help you analyze and improve your change communications. Please paste your communication draft below, and I'll provide feedback on clarity, completeness, and effectiveness.",
    },
    {
      id: "stakeholder",
      name: "Stakeholder Mapping",
      description: "Identify and analyze key stakeholders",
      icon: UserGroupIcon,
      prompt:
        "I'm now in Stakeholder Mapping mode. I'll help you identify and analyze key stakeholders for your change initiative. Please provide:\n\n1. Name of the change initiative\n2. Brief description of the change\n3. Key departments or groups that might be affected",
    },
    {
      id: "resistance",
      name: "Resistance Management",
      description: "Strategies to manage emotional responses to change",
      icon: EmojiHappyIcon,
      prompt:
        "I'm now in Resistance Management mode. I'll help you develop strategies to manage emotional responses to change. Type anything to start!",
    },
    {
      id: "action-recommendations",
      name: "Action Recommendations",
      description:
        "Get tailored action plan recommendations for your initiative",
      icon: LightBulbIcon,
      prompt:
        "I'm now in Action Recommendations mode. I'll help you generate a tailored action plan for your change initiative. Please provide:\n\n1. Initiative name\n2. Initiative description\n3. Industry\n4. Organization size\n5. Current priorities (comma separated)\n6. Timeline constraints\n7. Risk tolerance (Low, Medium, High)",
    },
    {
      id: "generate-faqs",
      name: "Generate FAQs",
      description: "Create role-based FAQs for your change initiative",
      icon: QuestionMarkCircleIcon,
      prompt:
        "I'm now in FAQ Generation mode. I'll help you create comprehensive, role-based FAQs for your change initiative. Please provide:\n\n1. Initiative name\n2. Initiative description\n3. Target audiences (comma separated roles)\n4. Key concerns (comma separated)\n5. Timeline\n6. Delivery channels (comma separated)",
    },
  ];

  const handleToolClick = (toolId) => {
    setActiveToolId(toolId);

    // Get the tool details
    const selectedTool = tools.find((tool) => tool.id === toolId);

    // If we have access to the chat interface, activate the tool mode
    if (chatInterfaceRef.current && selectedTool) {
      if (toolId === "change-initiative") {
        // This special case uses the dedicated agent mode
        if (typeof chatInterfaceRef.current.activateAgentMode === "function") {
          chatInterfaceRef.current.activateAgentMode();
        } else {
          console.error(
            "activateAgentMode method not available on chatInterface ref"
          );
        }
      } else {
        // For other tools, use regular tool mode
        chatInterfaceRef.current.activateToolMode(
          selectedTool.id,
          selectedTool.prompt
        );
      }
    } else {
      console.error("Chat interface ref is not available");
    }
  };

  const handleExitTool = () => {
    setActiveToolId(null);
  };

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
            <ChatInterface
              ref={chatInterfaceRef}
              activeTool={activeToolId}
              onExitToolMode={handleExitTool}
              onToolModeChange={setActiveToolId}
            />
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
                  className={`w-full flex items-start p-3 rounded-lg transition-colors text-left
                    ${
                      activeToolId === tool.id
                        ? "bg-primary-100 border border-primary-300"
                        : "hover:bg-primary-50"
                    }`}
                  onClick={() => handleToolClick(tool.id)}
                >
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg
                    ${
                      activeToolId === tool.id
                        ? "bg-primary-500 text-white"
                        : "bg-primary-100 text-primary-600"
                    }`}
                  >
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
            <button className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg">
              Create Custom Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeAssistant;
