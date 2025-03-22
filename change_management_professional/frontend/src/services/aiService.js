// src/services/aiService.js
/**
 * Service for interacting with AI capabilities through the backend API
 */

// Set the base URL for the API
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

/**
 * Makes a request to the backend API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send with the request
 * @param {string} method - HTTP method (default: POST)
 * @returns {Promise} - The API response
 */
const makeApiRequest = async (endpoint, data, method = "POST") => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

/**
 * AI service methods for change management
 */
const aiService = {
  /**
   * Send a chat message to the backend
   * @param {string} message - User's message
   * @param {string} conversationId - Conversation identifier (optional)
   * @param {Array} history - Previous messages in the conversation (optional)
   * @returns {Promise} - Chat response
   */
  sendChatMessage: async (message, conversationId = null, history = []) => {
    return makeApiRequest("/chat/chat", {
      message,
      conversation_id: conversationId,
      history,
    });
  },

  /**
   * Submit feedback for a chat response
   * @param {string} conversationId - Conversation identifier
   * @param {number} rating - Rating (1-5)
   * @param {string} feedbackText - Feedback text (optional)
   * @returns {Promise} - Feedback submission response
   */
  submitFeedback: async (conversationId, rating, feedbackText = "") => {
    return makeApiRequest("/chat/feedback", {
      conversation_id: conversationId,
      rating,
      feedback_text: feedbackText,
    });
  },

  /**
   * Generate an action plan based on change data and framework
   * @param {Object} changeData - Data about the change
   * @param {string} framework - Selected change framework (ADKAR, Lewin, Kotter)
   * @returns {Promise} - Generated action plan
   */
  generateActionPlan: async (changeData, framework) => {
    const message = `
      Please generate an action plan for the following change initiative using the ${framework} framework:
      
      Title: ${changeData.changeTitle}
      Description: ${changeData.changeDescription}
      Technology Type: ${changeData.technologyType}
      Affected Departments: ${changeData.departments.join(", ")}
      Current Systems: ${changeData.currentSystems}
      New Systems: ${changeData.newSystems}
      Start Date: ${changeData.startDate}
      End Date: ${changeData.endDate}
    `;

    const response = await aiService.sendChatMessage(message);
    return {
      phases: parseActionPlanResponse(response.response),
    };
  },

  /**
   * Analyze potential resistance points in a change initiative
   * @param {Object} changeData - Data about the change
   * @returns {Promise} - Resistance analysis
   */
  analyzeResistance: async (changeData) => {
    const message = `
      Analyze potential resistance points for this technology change implementation:
      
      Title: ${changeData.changeTitle}
      Description: ${changeData.changeDescription}
      Technology Type: ${changeData.technologyType}
      Affected Departments: ${changeData.departments.join(", ")}
      Current Systems: ${changeData.currentSystems}
      New Systems: ${changeData.newSystems}
      Start Date: ${changeData.startDate}
      End Date: ${changeData.endDate}
      
      Format your response as a resistance analysis with overall risk level, department-specific risks, key factors, and recommended approaches.
    `;

    const response = await aiService.sendChatMessage(message);
    return parseResistanceAnalysisResponse(response.response);
  },

  /**
   * Analyze communication for effectiveness
   * @param {string} content - Communication content
   * @param {Object} details - Communication details
   * @returns {Promise} - Communication analysis
   */
  analyzeCommunication: async (content, details) => {
    const message = `
      Please analyze this change management communication for effectiveness:
      
      Title: ${details.title}
      Audience: ${details.audience}
      Purpose: ${details.purpose}
      Channel: ${details.channel}
      
      Communication content:
      ${content}
      
      Analyze it for clarity, tone, completeness, and emotional impact.
      Suggest improvements and identify key terms that contribute to or detract from the message.
    `;

    const response = await aiService.sendChatMessage(message);
    return parseAnalysisResponse(response.response);
  },

  /**
   * Generate a communication based on change data
   * @param {Object} changeData - Data about the change
   * @param {Object} communicationDetails - Details about the communication
   * @returns {Promise} - Generated communication
   */
  generateCommunication: async (changeData, communicationDetails) => {
    const message = `
      Generate a change management communication with the following details:
      
      Change details:
      Title: ${changeData.changeTitle}
      Description: ${changeData.changeDescription}
      Technology Type: ${changeData.technologyType}
      Current Systems: ${changeData.currentSystems}
      New Systems: ${changeData.newSystems}
      
      Communication details:
      Audience: ${communicationDetails.audience}
      Purpose: ${communicationDetails.purpose}
      Channel: ${communicationDetails.channel}
    `;

    const response = await aiService.sendChatMessage(message);
    return { content: response.response };
  },

  /**
   * Compare change management frameworks
   * @param {string[]} frameworks - Array of framework names to compare
   * @returns {Promise} - Comparison results
   */
  compareFrameworks: async (frameworks) => {
    const message = `
      Compare the following change management frameworks:
      ${frameworks.join(", ")}
      
      Please highlight their similarities, differences, strengths, and weaknesses.
    `;

    const response = await aiService.sendChatMessage(message);
    return parseComparisonResponse(response.response);
  },
};

// Helper functions to parse responses (basic implementation)
// In a production app, you might need more sophisticated parsing

function parseActionPlanResponse(text) {
  // Basic parsing - in real implementation, you'd handle this more robustly
  // This is a simplified version that just returns the text as a single phase
  return [
    {
      name: "Implementation Plan",
      description: "Generated action plan",
      actions: [
        {
          title: "Generated Plan",
          description: text,
          owner: "Change Manager",
          timeline: "As defined in plan",
        },
      ],
    },
  ];
}

function parseResistanceAnalysisResponse(text) {
  // Simplified parser - in real implementation you would parse the response
  // more intelligently into structured data
  return {
    overallRisk: "See analysis",
    departmentRisks: [],
    keyFactors: [],
    recommendedApproaches: [],
    fullAnalysis: text,
  };
}

function parseAnalysisResponse(text) {
  // Simple parser for communication analysis
  return {
    scores: {
      clarity: 0,
      tone: 0,
      completeness: 0,
      emotionalImpact: 0,
    },
    suggestions: text,
    keyTerms: [],
  };
}

function parseComparisonResponse(text) {
  // Simple parser for framework comparison
  return {
    comparison: text,
    frameworks: {},
  };
}

export default aiService;
