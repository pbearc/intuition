// src/services/api.js
/**
 * API service for making HTTP requests to backend services
 * For the hackathon, this will mostly simulate API calls with mock data
 */

// Base URL for API requests - would be configurable in a real application
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.changemanagement.example";

/**
 * Make a generic HTTP request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Promise} Response data
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    // For hackathon, simulate API call with timeout
    if (process.env.NODE_ENV === "development") {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: options.mockData || {} });
        }, 1000);
      });
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return { data };
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

/**
 * API methods for change management services
 */
const api = {
  /**
   * Get all change initiatives
   * @returns {Promise} List of change initiatives
   */
  getChangeInitiatives: () => {
    return request("/changes", {
      method: "GET",
      mockData: [
        {
          id: 1,
          title: "CRM Implementation",
          status: "In Progress",
          progress: 65,
          framework: "ADKAR",
          startDate: "2025-01-15",
          endDate: "2025-04-30",
        },
        {
          id: 2,
          title: "Cloud Migration",
          status: "Planning",
          progress: 25,
          framework: "Lewin's",
          startDate: "2025-03-01",
          endDate: "2025-07-15",
        },
        {
          id: 3,
          title: "Remote Work Tools",
          status: "Completed",
          progress: 100,
          framework: "Kotter's",
          startDate: "2024-11-01",
          endDate: "2025-02-28",
        },
      ],
    });
  },

  /**
   * Get a specific change initiative by ID
   * @param {number} id - Change initiative ID
   * @returns {Promise} Change initiative details
   */
  getChangeById: (id) => {
    return request(`/changes/${id}`, {
      method: "GET",
      mockData: {
        id,
        title: "CRM Implementation",
        description: "Implementing a new CRM system to replace legacy tools.",
        status: "In Progress",
        progress: 65,
        framework: "ADKAR",
        technologyType: "crm",
        departments: ["sales", "marketing", "customerService"],
        currentSystems: "Legacy in-house CRM",
        newSystems: "Salesforce",
        startDate: "2025-01-15",
        endDate: "2025-04-30",
        stakeholders: ["executives", "managers", "endUsers"],
        objectives:
          "Improve customer data management and sales workflow efficiency",
        successMetrics:
          "Adoption rate, time to complete sales tasks, customer satisfaction",
      },
    });
  },

  /**
   * Create a new change initiative
   * @param {Object} data - Change initiative data
   * @returns {Promise} Created change initiative
   */
  createChange: (data) => {
    return request("/changes", {
      method: "POST",
      body: JSON.stringify(data),
      mockData: {
        id: 4,
        ...data,
        status: "Planning",
        progress: 0,
      },
    });
  },

  /**
   * Update an existing change initiative
   * @param {number} id - Change initiative ID
   * @param {Object} data - Updated data
   * @returns {Promise} Updated change initiative
   */
  updateChange: (id, data) => {
    return request(`/changes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      mockData: {
        id,
        ...data,
      },
    });
  },

  /**
   * Get action plan for a change initiative
   * @param {number} changeId - Change initiative ID
   * @param {string} framework - Change framework (ADKAR, Lewin, Kotter)
   * @returns {Promise} Action plan
   */
  getActionPlan: (changeId, framework) => {
    return request(`/changes/${changeId}/plan`, {
      method: "GET",
      mockData: {
        changeId,
        framework,
        phases: [
          {
            name: "Phase 1",
            description: "Description of phase 1",
            actions: [
              {
                title: "Action 1",
                description: "Description of action 1",
                owner: "Owner Name",
                timeline: "1-2 weeks",
                status: "Not Started",
              },
            ],
          },
        ],
      },
    });
  },

  /**
   * Generate action plan using AI
   * @param {Object} changeData - Change data
   * @param {string} framework - Change framework (ADKAR, Lewin, Kotter)
   * @returns {Promise} Generated action plan
   */
  generateActionPlan: (changeData, framework) => {
    return request("/ai/generate-plan", {
      method: "POST",
      body: JSON.stringify({ changeData, framework }),
      mockData: {
        // This would be a mock response simulating the AI-generated plan
        // Real implementation would call to LLM API
        framework,
        phases: [],
      },
    });
  },

  /**
   * Analyze resistance for a change initiative
   * @param {Object} changeData - Change data
   * @returns {Promise} Resistance analysis
   */
  analyzeResistance: (changeData) => {
    return request("/ai/analyze-resistance", {
      method: "POST",
      body: JSON.stringify({ changeData }),
      mockData: {
        overallRisk: "Medium",
        departmentRisks: [
          {
            department: "Sales",
            level: "High",
            reasons: [
              "Significant workflow changes",
              "High comfort with current tools",
            ],
          },
          {
            department: "IT",
            level: "Low",
            reasons: ["Technical familiarity", "Early involvement in planning"],
          },
          {
            department: "Marketing",
            level: "Medium",
            reasons: ["Moderate workflow changes", "Some training needed"],
          },
          {
            department: "Finance",
            level: "High",
            reasons: ["Data migration concerns", "Reporting changes"],
          },
          {
            department: "Operations",
            level: "Medium",
            reasons: [
              "Process adjustments required",
              "Benefits to daily tasks",
            ],
          },
        ],
        keyFactors: [
          {
            factor: "Training Time",
            impact: "High",
            mitigation:
              "Implement micro-learning modules throughout the workday",
          },
          {
            factor: "Workflow Disruption",
            impact: "Medium",
            mitigation: "Phase implementation with parallel systems initially",
          },
          {
            factor: "Data Quality Concerns",
            impact: "High",
            mitigation: "Run data validation workshops before migration",
          },
          {
            factor: "User Interface Changes",
            impact: "Medium",
            mitigation: "Provide visual guides showing old vs. new UI",
          },
        ],
        recommendedApproaches: [
          {
            title: "Early Involvement",
            description:
              "Engage high-risk departments in planning and testing phases",
            priority: "High",
          },
          {
            title: "Tailored Communications",
            description:
              "Create department-specific messaging addressing key concerns",
            priority: "High",
          },
          {
            title: "Phased Rollout",
            description:
              "Implement changes gradually starting with low-resistance departments",
            priority: "Medium",
          },
          {
            title: "Super User Network",
            description: "Identify and train champions within each department",
            priority: "High",
          },
        ],
      },
    });
  },

  /**
   * Analyze communication for effectiveness
   * @param {string} content - Communication content
   * @param {Object} details - Communication details (audience, purpose, etc.)
   * @returns {Promise} Communication analysis
   */
  analyzeCommunication: (content, details) => {
    return request("/ai/analyze-communication", {
      method: "POST",
      body: JSON.stringify({ content, details }),
      mockData: {
        clarity: 85,
        tone: 70,
        completeness: 90,
        emotionalImpact: 65,
        suggestedImprovements: [
          {
            type: "clarity",
            original: "Implementation of the system will commence next month.",
            suggestion:
              "We will begin rolling out the new CRM system on April 15, 2025.",
            reason: "More specific timeline helps reduce uncertainty",
          },
          {
            type: "tone",
            original: "You will need to complete training by the deadline.",
            suggestion:
              "We invite you to participate in our interactive training sessions before April 1.",
            reason:
              "Invitational tone creates better engagement than mandatory language",
          },
          {
            type: "completeness",
            original: "",
            suggestion: 'Add a section on "How This Affects Your Daily Work"',
            reason:
              "Addressing personal impact increases relevance for recipients",
          },
        ],
        keyTerms: {
          positive: ["improve", "enhance", "opportunity", "support"],
          negative: ["mandatory", "deadline", "must"],
          missing: ["benefits", "assistance", "resources"],
        },
      },
    });
  },

  /**
   * Get communication templates
   * @param {string} audience - Target audience
   * @param {string} purpose - Communication purpose
   * @returns {Promise} List of communication templates
   */
  getCommunicationTemplates: (audience, purpose) => {
    return request("/templates/communication", {
      method: "GET",
      params: { audience, purpose },
      mockData: [
        {
          id: 1,
          title: "CRM Implementation Announcement",
          description:
            "Initial announcement of a new CRM system implementation",
          audience: ["all", "sales"],
          purpose: "announce",
          content: "...", // Template content
        },
        {
          id: 2,
          title: "New System Training Invitation",
          description: "Invitation for employees to attend training sessions",
          audience: ["all", "sales", "marketing", "finance"],
          purpose: "training",
          content: "...", // Template content
        },
      ],
    });
  },

  /**
   * Get adoption metrics
   * @param {string} timeRange - Time range (7d, 30d, 90d, etc.)
   * @param {number} changeId - Change initiative ID (optional)
   * @returns {Promise} Adoption metrics
   */
  getAdoptionMetrics: (timeRange, changeId) => {
    return request("/analytics/adoption", {
      method: "GET",
      params: { timeRange, changeId },
      mockData: {
        overallAdoption: 76,
        departmentAdoption: {
          sales: 82,
          marketing: 68,
          it: 95,
          finance: 59,
          customerService: 72,
        },
        usageFrequency: [
          { date: "2025-02-01", users: 120 },
          { date: "2025-02-08", users: 245 },
          { date: "2025-02-15", users: 310 },
          { date: "2025-02-22", users: 378 },
          { date: "2025-03-01", users: 412 },
        ],
      },
    });
  },

  /**
   * Get feedback analytics
   * @param {string} timeRange - Time range (7d, 30d, 90d, etc.)
   * @param {number} changeId - Change initiative ID (optional)
   * @returns {Promise} Feedback analytics
   */
  getFeedbackAnalytics: (timeRange, changeId) => {
    return request("/analytics/feedback", {
      method: "GET",
      params: { timeRange, changeId },
      mockData: {
        sentimentSummary: {
          positive: 68,
          neutral: 21,
          negative: 11,
          totalResponses: 680,
        },
        commonThemes: [
          {
            theme: "Training Quality",
            sentiment: "positive",
            mentions: 148,
            example:
              "The training sessions were comprehensive and well-organized.",
          },
          {
            theme: "System Speed",
            sentiment: "negative",
            mentions: 72,
            example:
              "The new system is noticeably slower than our previous solution.",
          },
          {
            theme: "Feature Parity",
            sentiment: "neutral",
            mentions: 93,
            example:
              "Most features transferred well, but we're still missing some key functionality.",
          },
        ],
      },
    });
  },

  /**
   * Get change management frameworks
   * @returns {Promise} List of change management frameworks
   */
  getChangeFrameworks: () => {
    return request("/knowledge/frameworks", {
      method: "GET",
      mockData: [
        {
          id: "adkar",
          name: "ADKAR Model",
          description:
            "A goal-oriented change management model that guides individual and organizational change.",
          elements: [
            "Awareness",
            "Desire",
            "Knowledge",
            "Ability",
            "Reinforcement",
          ],
          bestFor:
            "Individual change management and focusing on the people side of change.",
          resources: [
            { title: "ADKAR Overview", type: "document" },
            { title: "ADKAR Assessment Tool", type: "tool" },
            { title: "ADKAR in Technology Implementation", type: "case-study" },
          ],
        },
        {
          id: "lewin",
          name: "Lewin's Change Model",
          description:
            "A three-stage model that involves unfreezing, changing, and refreezing.",
          elements: ["Unfreeze", "Change", "Refreeze"],
          bestFor:
            "Understanding the process of change and why people resist change.",
          resources: [
            { title: "Lewin's Change Model Overview", type: "document" },
            { title: "Unfreezing Techniques", type: "tool" },
            { title: "Refreezing Best Practices", type: "guide" },
          ],
        },
      ],
    });
  },

  /**
   * Get case studies
   * @param {string} industry - Industry filter (optional)
   * @param {string} changeType - Change type filter (optional)
   * @param {string} framework - Framework filter (optional)
   * @returns {Promise} List of case studies
   */
  getCaseStudies: (industry, changeType, framework) => {
    return request("/knowledge/case-studies", {
      method: "GET",
      params: { industry, changeType, framework },
      mockData: [
        {
          id: "case1",
          title: "CRM Implementation at Global Financial Services Firm",
          industry: "Financial Services",
          changeType: "Technology",
          framework: "ADKAR",
          challenge:
            "Replacing legacy CRM with modern cloud solution across 5,000 users",
          outcome: "Successful adoption with 92% user satisfaction",
          keyInsights: [
            "Early executive sponsorship was critical",
            "Department-specific training improved adoption",
            "Iterative feedback loops helped refine the implementation",
          ],
        },
      ],
    });
  },
};

export default api;
