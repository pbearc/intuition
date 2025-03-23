import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import aiService from "../../services/aiService";
import technologyService from "../../services/technologyService";
import integrationService from "../../services/integrationService";
import {
  PaperAirplaneIcon,
  XIcon,
  ChartPieIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EmojiHappyIcon,
  ThumbUpIcon,
  DownloadIcon,
  LightningBoltIcon,
  CodeIcon,
  CalendarIcon,
  PlusCircleIcon,
  ClockIcon,
} from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";
import { format, addDays, parse } from "date-fns";

const ChatInterface = forwardRef((props, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [agentMode, setAgentMode] = useState(false);
  const [toolMode, setToolMode] = useState(null); // Tool mode identifier
  const [toolModeState, setToolModeState] = useState({}); // State for step-by-step tools
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [agentState, setAgentState] = useState({
    step: 0,
    data: {
      name: "",
      description: "",
      trainingLink: "",
      departmentIds: [],
      sendNotifications: false,
      integrations: {
        jira: false,
        jiraProjectKey: "",
        jiraDetails: null,
        calendar: false,
        calendarSessions: [],
        calendarDetails: null,
      },
    },
  });
  const [departments, setDepartments] = useState([]);
  const [jiraProjects, setJiraProjects] = useState([]);
  const messagesEndRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    activateToolMode: (toolId, prompt) => {
      // Exit any active modes
      setAgentMode(false);
      setToolMode(toolId);

      // Initialize the tool state if needed
      if (!toolModeState[toolId]) {
        setToolModeState({
          ...toolModeState,
          [toolId]: {
            step: 0,
            inputData: {},
            analysis: null,
            visualizationData: null,
          },
        });
      }

      // Add the tool's introduction message
      const assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content: prompt,
        timestamp: new Date(),
        tool: toolId,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    },
    activateAgentMode: () => {
      // Set agent mode active
      setAgentMode(true);
      setToolMode(null); // Exit any active tool mode

      // Add the initial agent message
      const assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          "I'm now in Technology Change Agent mode. Please provide the name of the new technology:",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Reset agent state
      setAgentState({
        step: 0,
        data: {
          name: "",
          description: "",
          trainingLink: "",
          departmentIds: [],
          sendNotifications: false,
          integrations: {
            jira: false,
            jiraProjectKey: "",
            jiraDetails: null,
            calendar: false,
            calendarSessions: [],
            calendarDetails: null,
          },
        },
      });
    },
  }));

  // Exit tool mode when necessary
  useEffect(() => {
    if (props.activeTool === null && toolMode !== null) {
      setToolMode(null);
    }

    if (props.activeTool === null && agentMode) {
      setAgentMode(false);
    }
  }, [props.activeTool, toolMode, agentMode]);

  // Initialize with a welcome message and fetch data
  useEffect(() => {
    setMessages([
      {
        id: uuidv4(),
        role: "assistant",
        content:
          "Hello! I'm your Change Management Assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);

    // Generate a unique conversation ID
    setConversationId(uuidv4());

    // Fetch departments for agent mode
    const fetchDepartments = async () => {
      try {
        const depts = await technologyService.getDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    // Fetch Jira projects
    const fetchJiraProjects = async () => {
      try {
        const response = await integrationService.getJiraProjects();
        setJiraProjects(response.projects || []);
      } catch (error) {
        console.error("Error fetching Jira projects:", error);
      }
    };

    fetchDepartments();
    fetchJiraProjects();

    // Set up a timer to ask for feedback after some time
    const feedbackTimer = setTimeout(() => {
      setShowFeedbackPrompt(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(feedbackTimer);
  }, []);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !(agentMode && agentState.step === 3)) return;

    if (agentMode) {
      handleAgentModeInput();
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let response;

      // If in tool mode, use the appropriate API endpoint
      if (toolMode) {
        response = await handleToolRequest(toolMode, input);
      } else {
        // Regular chat mode - existing code
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        response = await aiService.sendChatMessage(
          input,
          conversationId,
          history
        );
      }

      // Add assistant response to chat
      const assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          typeof response === "object"
            ? response.response || JSON.stringify(response, null, 2)
            : response,
        timestamp: new Date(),
        sources: response.sources || [],
        analysis: response.analysis || null,
        visualizationData: response.visualizationData || null,
        tool: toolMode, // Mark which tool generated this
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Update conversation ID if provided by the server
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message to chat
      const errorMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
        isError: true,
        tool: toolMode,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to handle tool-specific requests with step-by-step approach
  const handleToolRequest = async (toolId, userInput) => {
    try {
      let response;

      // For step-by-step tools, pass the current step and input data
      if (
        toolId === "scope" ||
        toolId === "stakeholder" ||
        toolId === "resistance"
      ) {
        const toolState = toolModeState[toolId] || { step: 0, inputData: {} };

        // Add user input to data (if not in first step)
        if (toolState.step > 0) {
          toolState.inputData = {
            ...toolState.inputData,
            user_input: userInput,
          };
        }

        // Make API request with current step and data
        if (toolId === "scope") {
          response = await technologyService.analyzeScopeOfChange({
            step: toolState.step,
            input_data: toolState.inputData,
          });
        } else if (toolId === "stakeholder") {
          response = await technologyService.mapStakeholders({
            step: toolState.step,
            input_data: toolState.inputData,
          });
        } else if (toolId === "resistance") {
          response = await technologyService.manageResistance({
            step: toolState.step,
            input_data: toolState.inputData,
          });
        }

        // Update tool state for next step
        setToolModeState({
          ...toolModeState,
          [toolId]: {
            step: response.next_step,
            inputData: response.current_data || toolState.inputData,
            analysis: response.analysis || toolState.analysis,
            visualizationData:
              response.visualization_data || toolState.visualizationData,
          },
        });

        // Return the prompt for the current step
        return {
          response: response.prompt,
          step: response.next_step,
          analysis: response.analysis,
          visualizationData: response.visualization_data,
        };
      } else if (toolId === "communication") {
        // Communication review expects the full draft at once
        response = await technologyService.reviewCommunication({
          communication_draft: userInput,
          audience: "All employees", // Could be updated with more context
          purpose: "Inform about change",
          change_context: "Organizational change",
        });

        // Format the response in a readable way
        const formattedResponse = formatCommunicationReview(response);
        return { response: formattedResponse, analysis: response };
      } else {
        // Regular chat response if no specific tool
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        response = await aiService.sendChatMessage(
          userInput,
          conversationId,
          history
        );
        return response;
      }
    } catch (error) {
      console.error(`Error in ${toolId} tool:`, error);
      return {
        response: `Sorry, I encountered an error while using the ${toolId} tool. Please try again or use a different approach.`,
        error: true,
      };
    }
  };

  // Helper function to format communication review results
  const formatCommunicationReview = (review) => {
    if (!review) return "Sorry, I couldn't analyze the communication draft.";

    let formattedResponse = `## Communication Review\n\n`;

    // Quick assessment
    formattedResponse += `### Overall Assessment\n${
      review.quick_assessment || "No assessment provided."
    }\n\n`;

    // Scores
    formattedResponse += `### Scores\n`;
    if (review.scores) {
      formattedResponse += `- Clarity: ${review.scores.clarity}/100\n`;
      formattedResponse += `- Impact: ${review.scores.impact}/100\n`;
      formattedResponse += `- Completeness: ${review.scores.completeness}/100\n`;
      formattedResponse += `- Emotional Tone: ${review.scores.emotional_tone}/100\n`;
      formattedResponse += `- Call to Action: ${review.scores.call_to_action}/100\n`;
      formattedResponse += `- Overall Score: ${review.scores.overall}/100\n\n`;
    }

    // Strengths
    formattedResponse += `### Strengths\n`;
    if (review.strengths && review.strengths.length > 0) {
      review.strengths.forEach((strength, i) => {
        formattedResponse += `${i + 1}. ${strength}\n`;
      });
    } else {
      formattedResponse += "No specific strengths identified.\n";
    }
    formattedResponse += "\n";

    // Improvement areas
    formattedResponse += `### Areas for Improvement\n`;
    if (review.improvement_areas && review.improvement_areas.length > 0) {
      review.improvement_areas.forEach((area, i) => {
        formattedResponse += `${i + 1}. ${area}\n`;
      });
    } else {
      formattedResponse += "No specific improvement areas identified.\n";
    }
    formattedResponse += "\n";

    // Revised draft
    formattedResponse += `### Revised Draft\n\n`;
    formattedResponse += review.revised_draft || "No revised draft available.";

    return formattedResponse;
  };

  const handleAgentModeInput = async () => {
    const currentStep = agentState.step;
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    // Update agent state based on current step
    let nextStep = currentStep + 1;
    let updatedData = { ...agentState.data };
    let assistantMessage = {
      id: uuidv4(),
      role: "assistant",
      timestamp: new Date(),
    };

    switch (currentStep) {
      case 0: // Technology Name
        updatedData.name = input;
        assistantMessage.content =
          "Please provide a description of the technology:";
        break;

      case 1: // Technology Description
        updatedData.description = input;
        assistantMessage.content =
          "Please provide a training link (optional, press Enter to skip):";
        break;

      case 2: // Training Link
        updatedData.trainingLink = input || "";
        assistantMessage.content = "Please select the affected departments:";
        // This will be replaced by department selection UI
        break;

      case 3: // Department selection is handled in the UI
        // Skip to next step - now we ask about integrations
        nextStep = 4;
        assistantMessage.content =
          "Would you like to integrate with Jira to create tracking tickets for this change?";
        break;

      case 4: // Jira integration option - handled by Yes/No buttons
        break;

      case 5: // Jira project selection or Google Calendar integration option
        if (agentState.data.integrations.jira) {
          // If Jira integration is selected, the step is for selecting project
          updatedData.integrations.jiraProjectKey = input;
          assistantMessage.content =
            "Would you like to schedule training sessions in Google Calendar?";
          nextStep = 6;
        } else {
          // If Jira integration was skipped, this step is for Google Calendar option
          nextStep = 6;
          // The UI will handle this response with buttons
        }
        break;

      case 6: // Google Calendar integration option - handled by Yes/No buttons
        break;

      case 7: // Training session configuration handled in UI or Email notification question
        if (agentState.data.integrations.calendar) {
          // Calendar integration UI handles this step
          nextStep = 8;
          assistantMessage.content =
            "Would you like to send email notifications to the department PICs?";
        } else {
          // Skip to email notification question
          nextStep = 8;
          assistantMessage.content =
            "Would you like to send email notifications to the department PICs?";
        }
        break;

      case 8: // Email notification - handled by Yes/No buttons
        break;

      default:
        // Reset agent mode
        setAgentMode(false);
        nextStep = 0;
        updatedData = {
          name: "",
          description: "",
          trainingLink: "",
          departmentIds: [],
          sendNotifications: false,
          integrations: {
            jira: false,
            jiraProjectKey: "",
            jiraDetails: null,
            calendar: false,
            calendarSessions: [],
            calendarDetails: null,
          },
        };
        assistantMessage.content =
          "Agent mode has been reset. How can I help you today?";
    }

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setAgentState({
      step: nextStep,
      data: updatedData,
    });
  };

  const exitAgentMode = () => {
    setAgentMode(false);

    const assistantMessage = {
      id: uuidv4(),
      role: "assistant",
      content:
        "I've exited Technology Change Agent mode. How can I help you today?",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    if (props.onExitToolMode) {
      props.onExitToolMode();
    }
  };

  const exitToolMode = () => {
    setToolMode(null);

    if (props.onExitToolMode) {
      props.onExitToolMode();
    }

    const assistantMessage = {
      id: uuidv4(),
      role: "assistant",
      content:
        "I've exited the specialized tool mode. How else can I help you with change management?",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
  };

  const handleDepartmentSelect = (deptId) => {
    setAgentState((prevState) => {
      const departmentIds = [...prevState.data.departmentIds];

      if (departmentIds.includes(deptId)) {
        // Remove if already selected
        const index = departmentIds.indexOf(deptId);
        departmentIds.splice(index, 1);
      } else {
        // Add if not selected
        departmentIds.push(deptId);
      }

      return {
        ...prevState,
        data: {
          ...prevState.data,
          departmentIds,
        },
      };
    });
  };

  // Handle yes/no responses for integration options
  const handleIntegrationResponse = (step, isYes) => {
    // Add user's choice as a message
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: isYes ? "Yes" : "No",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    let assistantMessage = {
      id: uuidv4(),
      role: "assistant",
      timestamp: new Date(),
    };

    // Handle based on current step
    if (step === 4) {
      // Jira integration
      setAgentState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          integrations: {
            ...prev.data.integrations,
            jira: isYes,
          },
        },
        step: 5,
      }));

      if (isYes) {
        assistantMessage.content =
          "Please select a Jira project key for this change initiative:";

        // If we have Jira projects, list them
        if (jiraProjects.length > 0) {
          assistantMessage.content += "\n\nAvailable projects:";
          jiraProjects.forEach((project) => {
            assistantMessage.content += `\n- ${project.name} (${project.key})`;
          });
        }
      } else {
        assistantMessage.content =
          "Would you like to schedule training sessions in Google Calendar?";
        setAgentState((prev) => ({ ...prev, step: 6 }));
      }
    } else if (step === 6) {
      // Google Calendar integration
      setAgentState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          integrations: {
            ...prev.data.integrations,
            calendar: isYes,
          },
        },
        step: 7,
      }));

      if (isYes) {
        // Initialize default calendar sessions
        const calendarSessions = [
          {
            id: 1,
            title: `${agentState.data.name} - Training Session 1`,
            description: "Initial training session",
            date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
            startTime: "10:00",
            endTime: "11:30",
            location: "Virtual Meeting",
          },
          {
            id: 2,
            title: `${agentState.data.name} - Training Session 2`,
            description: "Follow-up training session",
            date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
            startTime: "10:00",
            endTime: "11:30",
            location: "Virtual Meeting",
          },
        ];

        setAgentState((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            integrations: {
              ...prev.data.integrations,
              calendarSessions,
            },
          },
        }));

        assistantMessage.content = "Please configure your training sessions:";
      } else {
        assistantMessage.content =
          "Would you like to send email notifications to the department PICs?";
        setAgentState((prev) => ({ ...prev, step: 8 }));
      }
    } else if (step === 8) {
      // Email notifications
      handleYesNoResponse(isYes);
      return; // No need to add an assistant message as handleYesNoResponse will handle it
    }

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
  };

  // Handle calendar session changes
  const handleSessionChange = (id, field, value) => {
    setAgentState((prev) => {
      const sessions = [...prev.data.integrations.calendarSessions];
      const sessionIndex = sessions.findIndex((s) => s.id === id);

      if (sessionIndex >= 0) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          [field]: value,
        };
      }

      return {
        ...prev,
        data: {
          ...prev.data,
          integrations: {
            ...prev.data.integrations,
            calendarSessions: sessions,
          },
        },
      };
    });
  };

  // Add a new calendar session
  const addCalendarSession = () => {
    setAgentState((prev) => {
      const sessions = [...prev.data.integrations.calendarSessions];
      const lastSession = sessions[sessions.length - 1];
      const lastDate = parse(lastSession.date, "yyyy-MM-dd", new Date());

      const newSession = {
        id: lastSession.id + 1,
        title: `${prev.data.name} - Training Session ${lastSession.id + 1}`,
        description: "Additional training session",
        date: format(addDays(lastDate, 7), "yyyy-MM-dd"),
        startTime: lastSession.startTime,
        endTime: lastSession.endTime,
        location: lastSession.location,
      };

      return {
        ...prev,
        data: {
          ...prev.data,
          integrations: {
            ...prev.data.integrations,
            calendarSessions: [...sessions, newSession],
          },
        },
      };
    });
  };

  // Remove a calendar session
  const removeCalendarSession = (id) => {
    setAgentState((prev) => {
      const sessions = [...prev.data.integrations.calendarSessions];
      if (sessions.length <= 1) {
        return prev; // Keep at least one session
      }

      return {
        ...prev,
        data: {
          ...prev.data,
          integrations: {
            ...prev.data.integrations,
            calendarSessions: sessions.filter((s) => s.id !== id),
          },
        },
      };
    });
  };

  // Confirm calendar sessions
  const confirmCalendarSessions = () => {
    const assistantMessage = {
      id: uuidv4(),
      role: "assistant",
      content: `Training sessions configured. Would you like to send email notifications to the department PICs?`,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setAgentState((prev) => ({ ...prev, step: 8 }));
  };

  // Handle Yes/No button clicks for sending notifications
  const handleYesNoResponse = async (isYes) => {
    // Add user's choice as a message
    const userMessage = {
      id: uuidv4(),
      role: "user",
      content: isYes ? "Yes" : "No",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Update agent state with the choice
    setAgentState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        sendNotifications: isYes,
      },
    }));

    // Submit the technology change
    setIsLoading(true);
    try {
      const result = await technologyService.createTechnologyChange({
        name: agentState.data.name,
        description: agentState.data.description,
        training_link: agentState.data.trainingLink,
        department_ids: agentState.data.departmentIds,
        send_notifications: isYes,
      });

      let successMessage = `Technology change "${
        agentState.data.name
      }" has been successfully registered.${
        isYes ? " Notifications have been sent to the department PICs." : ""
      }`;

      // If integrations were selected, run them
      if (agentState.data.integrations.jira) {
        try {
          const jiraResult = await integrationService.createJiraIssues(
            agentState.data.integrations.jiraProjectKey || "CHANGE",
            {
              initiative_name: agentState.data.name,
              initiative_description: agentState.data.description,
            }
          );

          // Store Jira result
          setAgentState((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              integrations: {
                ...prev.data.integrations,
                jiraDetails: jiraResult,
              },
            },
          }));

          successMessage += " Jira issues have been created for tracking.";
        } catch (error) {
          console.error("Error creating Jira issues:", error);
          successMessage += " (Failed to create Jira issues)";
        }
      }

      if (agentState.data.integrations.calendar) {
        try {
          // Format sessions for the API
          const formattedSessions =
            agentState.data.integrations.calendarSessions.map((session) => {
              const startDate = `${session.date}T${session.startTime}:00`;
              const endDate = `${session.date}T${session.endTime}:00`;

              return {
                title: session.title,
                description: session.description,
                start_date: startDate,
                end_date: endDate,
                location: session.location,
              };
            });

          const calendarResult =
            await integrationService.createCalendarEventsWithApiKey(
              {
                initiative_name: agentState.data.name,
                initiative_description: agentState.data.description,
              },
              formattedSessions
            );

          // Store calendar result
          setAgentState((prev) => ({
            ...prev,
            data: {
              ...prev.data,
              integrations: {
                ...prev.data.integrations,
                calendarDetails: calendarResult,
              },
            },
          }));

          successMessage +=
            " Training sessions have been scheduled in Google Calendar.";
        } catch (error) {
          console.error("Error scheduling calendar events:", error);
          // successMessage += " (Failed to schedule calendar events)";
        }
      }

      const assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content: successMessage,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // If there were integrations, show their details
      if (
        agentState.data.integrations.jira ||
        agentState.data.integrations.calendar
      ) {
        let integrationDetailsMessage = "";

        if (
          agentState.data.integrations.jira &&
          agentState.data.integrations.jiraDetails
        ) {
          integrationDetailsMessage += `\n\n**Jira Integration**\nProject: ${
            agentState.data.integrations.jiraDetails.project_key
          }\nItems created: ${
            agentState.data.integrations.jiraDetails.created_items?.length || 0
          }\n`;

          if (
            agentState.data.integrations.jiraDetails.created_items?.length > 0
          ) {
            integrationDetailsMessage += "\nCreated items:\n";
            agentState.data.integrations.jiraDetails.created_items.forEach(
              (item) => {
                integrationDetailsMessage += `- ${item.type}: ${
                  item.summary || item.key
                }\n`;
              }
            );
          }
        }

        if (
          agentState.data.integrations.calendar &&
          agentState.data.integrations.calendarDetails
        ) {
          integrationDetailsMessage += `\n\n**Google Calendar Integration**\n${
            agentState.data.integrations.calendarDetails.events?.length || 0
          } sessions scheduled\n`;

          if (agentState.data.integrations.calendarDetails.events?.length > 0) {
            integrationDetailsMessage += "\nScheduled sessions:\n";
            agentState.data.integrations.calendarDetails.events.forEach(
              (event) => {
                integrationDetailsMessage += `- ${event.title} (${
                  event.formatted_date || event.date
                } at ${event.formatted_time || event.time || ""})\n`;
                if (event.link) {
                  integrationDetailsMessage += `  [Add to calendar](${event.link})\n`;
                }
              }
            );
          }
        }

        if (integrationDetailsMessage) {
          const detailsMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `**Integration Details:**${integrationDetailsMessage}`,
            timestamp: new Date(),
          };

          setMessages((prevMessages) => [...prevMessages, detailsMessage]);
        }
      }

      // Exit agent mode
      setAgentMode(false);
      setAgentState({
        step: 0,
        data: {
          name: "",
          description: "",
          trainingLink: "",
          departmentIds: [],
          sendNotifications: false,
          integrations: {
            jira: false,
            jiraProjectKey: "",
            jiraDetails: null,
            calendar: false,
            calendarSessions: [],
            calendarDetails: null,
          },
        },
      });

      if (props.onExitToolMode) {
        props.onExitToolMode();
      }
    } catch (error) {
      console.error("Error creating technology change:", error);
      const errorMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while registering the technology change: " +
          (error.message || "Unknown error"),
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (rating, feedbackText) => {
    try {
      await technologyService.submitFeedback({
        tool_used: toolMode || "chat",
        rating: rating,
        feedback_text: feedbackText,
      });

      setShowFeedbackPrompt(false);

      const assistantMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          "Thank you for your feedback! Your input helps us improve the Change Management Assistant.",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render department selection for agent mode step 3
  const renderDepartmentSelection = () => {
    if (agentMode && agentState.step === 3) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">
            Select Affected Departments:
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`dept-${dept.id}`}
                  checked={agentState.data.departmentIds.includes(dept.id)}
                  onChange={() => handleDepartmentSelect(dept.id)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label
                  htmlFor={`dept-${dept.id}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {dept.name}
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const assistantMessage = {
                id: uuidv4(),
                role: "assistant",
                content: `Selected departments: ${agentState.data.departmentIds
                  .map((id) => departments.find((d) => d.id === id)?.name)
                  .filter(Boolean)
                  .join(
                    ", "
                  )}\n\nWould you like to integrate with Jira to create tracking tickets for this change?`,
                timestamp: new Date(),
              };

              setMessages((prevMessages) => [
                ...prevMessages,
                assistantMessage,
              ]);
              setAgentState((prev) => ({ ...prev, step: 4 }));
            }}
            className="mt-4 bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700"
          >
            Confirm Selections
          </button>
        </div>
      );
    }
    return null;
  };

  // Render Yes/No buttons for Jira integration option
  const renderJiraIntegrationOptions = () => {
    if (agentMode && agentState.step === 4) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">
            Would you like to integrate with Jira to create tracking tickets for
            this change?
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleIntegrationResponse(4, true)}
              className="py-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleIntegrationResponse(4, false)}
              className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render Jira project selection input
  const renderJiraProjectSelection = () => {
    if (
      agentMode &&
      agentState.step === 5 &&
      agentState.data.integrations.jira
    ) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">
            Select Jira Project:
          </h3>
          <div className="mt-2">
            <select
              className="w-full p-2 border border-gray-300 rounded"
              value={agentState.data.integrations.jiraProjectKey}
              onChange={(e) => {
                setAgentState((prev) => ({
                  ...prev,
                  data: {
                    ...prev.data,
                    integrations: {
                      ...prev.data.integrations,
                      jiraProjectKey: e.target.value,
                    },
                  },
                }));

                // Simulate user input for sending the message
                setInput(e.target.value);
                handleSendMessage();
              }}
            >
              <option value="" disabled>
                Select a project
              </option>
              {jiraProjects.map((project) => (
                <option key={project.key} value={project.key}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render Yes/No buttons for Google Calendar integration option
  const renderCalendarIntegrationOptions = () => {
    if (agentMode && agentState.step === 6) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">
            Would you like to schedule training sessions in Google Calendar?
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleIntegrationResponse(6, true)}
              className="py-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleIntegrationResponse(6, false)}
              className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render calendar session configuration
  const renderCalendarSessionConfig = () => {
    if (
      agentMode &&
      agentState.step === 7 &&
      agentState.data.integrations.calendar
    ) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-800">
              Configure Training Sessions:
            </h3>
            <button
              onClick={addCalendarSession}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircleIcon className="w-4 h-4 mr-1" />
              Add Session
            </button>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {agentState.data.integrations.calendarSessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-md p-3 space-y-3 bg-white"
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-gray-800">
                    Session {session.id}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeCalendarSession(session.id)}
                    disabled={
                      agentState.data.integrations.calendarSessions.length <= 1
                    }
                    className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={session.title}
                    onChange={(e) =>
                      handleSessionChange(session.id, "title", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={session.date}
                      onChange={(e) =>
                        handleSessionChange(session.id, "date", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Start
                      </label>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          handleSessionChange(
                            session.id,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        End
                      </label>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) =>
                          handleSessionChange(
                            session.id,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={session.location}
                    onChange={(e) =>
                      handleSessionChange(
                        session.id,
                        "location",
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm"
                    placeholder="Office, Virtual Meeting, etc."
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={confirmCalendarSessions}
            className="mt-4 bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700"
          >
            Confirm Sessions
          </button>
        </div>
      );
    }
    return null;
  };

  // Render Yes/No buttons for email notification step
  const renderYesNoButtons = () => {
    if (agentMode && agentState.step === 8) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">
            Would you like to send email notifications to the department PICs?
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleIntegrationResponse(8, true)}
              className="py-2 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => handleIntegrationResponse(8, false)}
              className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render feedback prompt
  const renderFeedbackPrompt = () => {
    if (showFeedbackPrompt) {
      return (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-primary-50">
          <h3 className="font-medium text-gray-800 mb-2">
            How am I doing? I'd appreciate your feedback!
          </h3>
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedbackSubmit(rating)}
                    className="p-1 rounded-full hover:bg-primary-100"
                  >
                    <ThumbUpIcon
                      className={`h-5 w-5 ${
                        rating <= 3 ? "text-gray-400" : "text-primary-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Any specific feedback or suggestions? (optional)"
              rows="2"
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setShowFeedbackPrompt(false)}
                className="text-sm text-gray-500 hover:text-gray-700 mr-2"
              >
                Skip
              </button>
              <button
                onClick={() => handleFeedbackSubmit(4, feedbackText)}
                className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render tool visualizations
  const renderToolVisualizations = (message) => {
    if (!message.visualizationData && !message.analysis) return null;

    // Based on tool type, render appropriate visualizations
    if (message.tool === "scope") {
      return (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Analysis Visualizations
          </h3>

          {/* Impact Heatmap */}
          {message.visualizationData?.impact_heatmap && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700">
                Department Impact Heatmap
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {message.visualizationData.impact_heatmap.description}
              </p>
              <div className="bg-white p-2 rounded border border-gray-200">
                <div className="text-xs text-gray-500">
                  Interactive heatmap visualization would appear here
                </div>
              </div>
            </div>
          )}

          {/* View Full Analysis Button */}
          {message.analysis && (
            <div className="flex justify-end mt-2">
              <button className="flex items-center text-xs text-primary-600 hover:text-primary-800">
                <DownloadIcon className="h-3 w-3 mr-1" />
                Download full analysis
              </button>
            </div>
          )}
        </div>
      );
    }

    // Add similar visualizations for other tools

    return null;
  };

  return (
    <div className="flex flex-col h-full rounded-lg shadow bg-white">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
              {toolMode === "scope" && <ChartPieIcon className="h-6 w-6" />}
              {toolMode === "communication" && (
                <DocumentTextIcon className="h-6 w-6" />
              )}
              {toolMode === "stakeholder" && (
                <UserGroupIcon className="h-6 w-6" />
              )}
              {toolMode === "resistance" && (
                <EmojiHappyIcon className="h-6 w-6" />
              )}
              {!toolMode && !agentMode && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              )}
              {agentMode && <LightningBoltIcon className="h-6 w-6" />}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {toolMode === "scope" && "Scope Analysis"}
                {toolMode === "communication" && "Communication Review"}
                {toolMode === "stakeholder" && "Stakeholder Mapping"}
                {toolMode === "resistance" && "Resistance Management"}
                {agentMode && "Technology Change Agent"}
                {!toolMode && !agentMode && "Change Management Chat"}
              </h3>
              <p className="text-xs text-gray-500">
                {toolMode
                  ? `Specialized tool mode`
                  : agentMode
                  ? "Registering new technology change"
                  : "Ask me about change frameworks, strategies, and best practices"}
              </p>
            </div>
          </div>

          {(toolMode || agentMode) && (
            <button
              onClick={toolMode ? exitToolMode : exitAgentMode}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary-600 text-white"
                    : message.isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>

                {/* Display sources if available */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs border-t border-gray-200 pt-1">
                    <p className="font-medium text-gray-600">Sources:</p>
                    <ul className="list-disc list-inside">
                      {message.sources.map((source, index) => (
                        <li key={index} className="truncate text-gray-600">
                          {source.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Render tool visualizations if available */}
                {message.role === "assistant" &&
                  (message.visualizationData || message.analysis) &&
                  renderToolVisualizations(message)}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback prompt */}
          {renderFeedbackPrompt()}

          {/* Department selection UI for agent mode */}
          {renderDepartmentSelection()}

          {/* Jira integration option */}
          {renderJiraIntegrationOptions()}

          {/* Jira project selection */}
          {renderJiraProjectSelection()}

          {/* Google Calendar integration option */}
          {renderCalendarIntegrationOptions()}

          {/* Calendar session configuration */}
          {renderCalendarSessionConfig()}

          {/* Yes/No buttons for notification question */}
          {renderYesNoButtons()}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder={
                agentMode
                  ? `Enter ${
                      agentState.step === 0
                        ? "technology name"
                        : agentState.step === 1
                        ? "description"
                        : agentState.step === 2
                        ? "training link (optional)"
                        : agentState.step === 5 &&
                          agentState.data.integrations.jira
                        ? "Jira project key"
                        : "..."
                    }`
                  : toolMode === "communication"
                  ? "Paste your communication draft here..."
                  : "Type your message..."
              }
              rows="3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={
                agentMode &&
                (agentState.step === 3 ||
                  agentState.step === 4 ||
                  agentState.step === 6 ||
                  agentState.step === 7 ||
                  agentState.step === 8)
              }
            ></textarea>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={
              isLoading ||
              (!input.trim() && !(agentMode && agentState.step === 3))
            }
            className={`p-2 rounded-full ${
              isLoading ||
              (!input.trim() && !(agentMode && agentState.step === 3))
                ? "bg-gray-300 text-gray-500"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            <PaperAirplaneIcon className="h-6 w-6 transform rotate-90" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {agentMode
            ? `Step ${agentState.step + 1} of 9: ${
                agentState.step === 0
                  ? "Enter technology name"
                  : agentState.step === 1
                  ? "Enter description"
                  : agentState.step === 2
                  ? "Enter training link"
                  : agentState.step === 3
                  ? "Select departments"
                  : agentState.step === 4
                  ? "Choose Jira integration"
                  : agentState.step === 5 && agentState.data.integrations.jira
                  ? "Select Jira project"
                  : agentState.step === 6
                  ? "Choose Calendar integration"
                  : agentState.step === 7
                  ? "Configure training sessions"
                  : "Confirm notifications"
              }`
            : toolMode
            ? `In ${toolMode} mode - provide details for analysis`
            : "Press Enter to send, Shift+Enter for a new line"}
        </div>
      </div>
    </div>
  );
});

export default ChatInterface;
