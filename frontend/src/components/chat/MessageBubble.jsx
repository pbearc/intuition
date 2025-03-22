import React from "react";
import { ThumbUpIcon, ThumbDownIcon } from "@heroicons/react/outline";

const MessageBubble = ({ message }) => {
  const isAi = message.sender === "ai";

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`mb-4 flex ${isAi ? "justify-start" : "justify-end"}`}>
      {isAi && (
        <div className="flex-shrink-0 mr-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            AI
          </div>
        </div>
      )}

      <div className={`max-w-3/4 ${isAi ? "mr-8" : "ml-8"}`}>
        <div
          className={`rounded-lg p-3 ${
            isAi ? "bg-gray-100 text-gray-800" : "bg-blue-600 text-white"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>

        <div className="mt-1 flex items-center text-xs text-gray-500">
          <span>{formatTime(message.timestamp)}</span>

          {isAi && (
            <div className="ml-2 flex space-x-1">
              <button className="p-1 hover:bg-gray-200 rounded-full">
                <ThumbUpIcon className="h-4 w-4" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded-full">
                <ThumbDownIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!isAi && (
        <div className="flex-shrink-0 ml-2">
          <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
            U
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
