// src/services/technologyService.js - UPDATED
/**
 * Service for managing technology change operations and change management tools
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
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

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
 * Technology service methods
 */
const technologyService = {
  /**
   * Get all departments
   * @returns {Promise} - List of departments
   */
  getDepartments: async () => {
    return makeApiRequest("/technology/departments", null, "GET");
  },

  /**
   * Create a new technology change
   * @param {Object} technologyData - Technology change data
   * @returns {Promise} - Created technology change
   */
  createTechnologyChange: async (technologyData) => {
    return makeApiRequest("/technology/technology-changes", technologyData);
  },

  /**
   * Get all technology changes
   * @returns {Promise} - List of technology changes
   */
  getTechnologyChanges: async () => {
    return makeApiRequest("/technology/technology-changes", null, "GET");
  },

  /**
   * Send a test email
   * @returns {Promise} - Test email result
   */
  sendTestEmail: async () => {
    return makeApiRequest("/technology/test-email", null, "GET");
  },

  /**
   * Integrate a new change initiative with Jira
   * @param {string} jiraProjectKey - Jira project key
   * @param {Object} initiativeData - Change initiative data
   * @param {Object} jiraConfig - Jira configuration (optional)
   * @returns {Promise} - Integration result
   */
  integrateWithJira: async (
    jiraProjectKey,
    initiativeData,
    jiraConfig = {}
  ) => {
    return makeApiRequest("/integrations/jira-integration", {
      jira_project_key: jiraProjectKey,
      initiative_data: initiativeData,
      jira_base_url: jiraConfig.baseUrl,
      jira_email: jiraConfig.email,
      jira_api_token: jiraConfig.apiToken,
    });
  },

  /**
   * Schedule learning sessions in Google Calendar
   * @param {string} calendarId - Google Calendar ID
   * @param {Object} initiativeData - Change initiative data
   * @param {string} credentialsJson - Google API credentials JSON (optional)
   * @returns {Promise} - Calendar integration result
   */
  scheduleLearningSessions: async (
    calendarId,
    initiativeData,
    credentialsJson = null
  ) => {
    return makeApiRequest("/integrations/calendar-integration", {
      calendar_id: calendarId,
      initiative_data: initiativeData,
      credentials_json: credentialsJson,
    });
  },

  /**
   * Analyze the scope of a change initiative
   * @param {Object} scopeData - Scope analysis data
   * @returns {Promise} - Scope analysis results
   */
  analyzeScopeOfChange: async (scopeData) => {
    return makeApiRequest("/tools/scope-analysis", scopeData);
  },

  /**
   * Review communication for a change initiative
   * @param {Object} communicationData - Communication data
   * @returns {Promise} - Communication review results
   */
  reviewCommunication: async (communicationData) => {
    return makeApiRequest("/tools/communication-review", communicationData);
  },

  /**
   * Map stakeholders for a change initiative
   * @param {Object} stakeholderData - Stakeholder mapping data
   * @returns {Promise} - Stakeholder mapping results
   */
  mapStakeholders: async (stakeholderData) => {
    return makeApiRequest("/tools/stakeholder-mapping", stakeholderData);
  },

  /**
   * Get resistance management strategies
   * @param {Object} resistanceData - Resistance management data
   * @returns {Promise} - Resistance management strategies
   */
  manageResistance: async (resistanceData) => {
    return makeApiRequest("/tools/resistance-management", resistanceData);
  },

  /**
   * Generate FAQs for a change initiative
   * @param {Object} faqData - FAQ generation data
   * @returns {Promise} - Generated FAQs
   */
  generateFAQs: async (faqData) => {
    return makeApiRequest("/tools/generate-faqs", faqData);
  },

  /**
   * Submit feedback on a tool
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise} - Feedback submission result
   */
  submitFeedback: async (feedbackData) => {
    return makeApiRequest("/tools/submit-feedback", feedbackData);
  },

  // Action Recommendations
  recommendActions: async (actionData) => {
    return makeApiRequest("/actions/recommend-actions", actionData);
  },

  // Advanced FAQ Generation
  generateAdvancedFAQs: async (faqData) => {
    return makeApiRequest("/faqs/generate-faqs", faqData);
  },
};

export default technologyService;
