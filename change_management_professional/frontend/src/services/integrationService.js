// src/services/integrationService.js
/**
 * Service for integrating with external systems like Jira and Google Calendar
 */

// Set the base URL for the API
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

/**
 * Makes a request to the backend API
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
 * Integration service methods
 */
const integrationService = {
  /**
   * Create Jira issues for a change initiative
   * @param {string} jiraProjectKey - Jira project key (defaults to Change01)
   * @param {Object} initiativeData - Initiative data
   * @returns {Promise} - Created Jira issues
   */
  createJiraIssues: async (jiraProjectKey = "Change01", initiativeData) => {
    console.log("Creating Jira issue in project:", jiraProjectKey);
    console.log("Initiative data:", initiativeData);

    try {
      const result = await makeApiRequest("/integrations/jira-integration", {
        jira_project_key: jiraProjectKey,
        initiative_data: initiativeData,
      });

      console.log("Jira integration result:", result);
      return result;
    } catch (error) {
      console.error("Error creating Jira issues:", error);
      throw error;
    }
  },

  /**
   * Create Google Calendar events for learning sessions using API key
   * @param {Object} initiativeData - Initiative data
   * @param {Array} trainingDates - Array of training session dates/times
   * @returns {Promise} - Calendar integration result
   */
  createCalendarEventsWithApiKey: async (initiativeData, trainingDates) => {
    return makeApiRequest("/integrations/calendar-integration", {
      initiative_data: initiativeData,
      training_dates: trainingDates,
    });
  },

  /**
   * Get Jira projects (simplified to return just Change01)
   * @returns {Promise} - List of Jira projects
   */
  getJiraProjects: async () => {
    // For the hackathon, return actual projects that exist
    return Promise.resolve({
      projects: [
        { key: "BHY", name: "BhanYu Jira Project" },
        { key: "CHAN", name: "Change Management" },
      ],
    });
  },

  /**
   * Get Google Calendars for a user
   * @returns {Promise} - List of Google Calendars
   */
  getGoogleCalendars: async () => {
    return Promise.resolve({
      calendars: [{ id: "primary", name: "My Calendar" }],
    });
  },
};

export default integrationService;
