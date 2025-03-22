// src/services/integrationService.js

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const integrationService = {
  /**
   * Fetch available Jira projects
   * @returns {Promise<Array>} Array of Jira projects
   */
  getJiraProjects: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/integrations/jira/projects`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Jira projects:", error);
      throw error;
    }
  },

  /**
   * Create Jira issues for a technology change initiative
   * @param {string} projectKey - Jira project key
   * @param {Object} initiativeData - Details about the technology change
   * @returns {Promise<Object>} Created Jira issues details
   */
  createJiraIssues: async (projectKey, initiativeData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/integrations/jira/create-issues`,
        {
          project_key: projectKey,
          initiative_name: initiativeData.initiative_name,
          initiative_description: initiativeData.initiative_description,
          // You can add more fields as needed
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating Jira issues:", error);
      throw error;
    }
  },

  // Other integration methods...
  createCalendarEventsWithApiKey: async (initiativeData, sessions) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/integrations/calendar/create-events`,
        {
          initiative_data: initiativeData,
          sessions: sessions,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating calendar events:", error);
      throw error;
    }
  },
};

export default integrationService;
