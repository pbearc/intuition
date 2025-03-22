import React, { useState, useEffect } from "react";
import { format, addDays, parse } from "date-fns";
import {
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  CodeIcon,
  ClipboardCheckIcon,
  XIcon,
} from "@heroicons/react/outline";
import integrationService from "../../services/integrationService";
import technologyService from "../../services/technologyService";

const IntegrationOptions = ({ initiativeData, onComplete, onCancel }) => {
  const [step, setStep] = useState("options");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jiraProjects, setJiraProjects] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [selectedJiraProject, setSelectedJiraProject] = useState("");
  const [selectedCalendar, setSelectedCalendar] = useState("primary");
  const [jiraConfig, setJiraConfig] = useState({
    baseUrl: "",
    email: "",
    apiToken: "",
  });
  const [jiraResult, setJiraResult] = useState(null);
  const [calendarResult, setCalendarResult] = useState(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState({
    jira: false,
    calendar: false,
  });

  // New state for training sessions
  const [trainingSessions, setTrainingSessions] = useState([
    {
      id: 1,
      title: `${
        initiativeData.initiative_name || "Change Initiative"
      } - Training Session 1`,
      description: "Initial training session",
      date: format(addDays(new Date(), 7), "yyyy-MM-dd"), // Default to 1 week from now
      startTime: "10:00",
      endTime: "11:30",
      location: "Virtual Meeting",
    },
    {
      id: 2,
      title: `${
        initiativeData.initiative_name || "Change Initiative"
      } - Training Session 2`,
      description: "Follow-up training session",
      date: format(addDays(new Date(), 14), "yyyy-MM-dd"), // Default to 2 weeks from now
      startTime: "10:00",
      endTime: "11:30",
      location: "Virtual Meeting",
    },
  ]);

  // Fetch available Jira projects and Google Calendars on mount
  useEffect(() => {
    const fetchIntegrationOptions = async () => {
      try {
        // In a real application, these would be authenticated API calls
        const jiraResponse = await integrationService.getJiraProjects();
        const calendarResponse = await integrationService.getGoogleCalendars();

        setJiraProjects(jiraResponse.projects || []);
        setCalendars(calendarResponse.calendars || []);

        if (jiraResponse.projects && jiraResponse.projects.length > 0) {
          setSelectedJiraProject(jiraResponse.projects[0].key);
        }
      } catch (error) {
        console.error("Error fetching integration options:", error);
        setError("Failed to load integration options. Please try again.");
      }
    };

    fetchIntegrationOptions();
  }, []);

  const handleToggleIntegration = (integration) => {
    setSelectedIntegrations({
      ...selectedIntegrations,
      [integration]: !selectedIntegrations[integration],
    });
  };

  const handleJiraConfigChange = (e) => {
    const { name, value } = e.target;
    setJiraConfig({
      ...jiraConfig,
      [name]: value,
    });
  };

  const handleCalendarChange = (e) => {
    setSelectedCalendar(e.target.value);
  };

  const handleJiraProjectChange = (e) => {
    setSelectedJiraProject(e.target.value);
  };

  // Handler for training session changes
  const handleTrainingSessionChange = (id, field, value) => {
    setTrainingSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === id ? { ...session, [field]: value } : session
      )
    );
  };

  // Function to add a new training session
  const addTrainingSession = () => {
    const lastSession = trainingSessions[trainingSessions.length - 1];
    const lastDate = parse(lastSession.date, "yyyy-MM-dd", new Date());

    const newSession = {
      id: trainingSessions.length + 1,
      title: `${
        initiativeData.initiative_name || "Change Initiative"
      } - Training Session ${trainingSessions.length + 1}`,
      description: "Additional training session",
      date: format(addDays(lastDate, 7), "yyyy-MM-dd"), // Default to 1 week after last session
      startTime: lastSession.startTime,
      endTime: lastSession.endTime,
      location: lastSession.location,
    };

    setTrainingSessions([...trainingSessions, newSession]);
  };

  // Function to remove a training session
  const removeTrainingSession = (id) => {
    if (trainingSessions.length <= 1) {
      return; // Keep at least one session
    }

    setTrainingSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== id)
    );
  };

  const handleContinue = () => {
    // If no integrations selected, just complete
    if (!selectedIntegrations.jira && !selectedIntegrations.calendar) {
      onComplete({
        jiraIntegrated: false,
        calendarIntegrated: false,
      });
      return;
    }

    // Otherwise, proceed to configuration
    setStep("configure");
  };

  const handleRunIntegrations = async () => {
    setLoading(true);
    setError(null);
    let jiraSuccess = false;
    let calendarSuccess = false;

    try {
      // Run Jira integration if selected
      if (selectedIntegrations.jira) {
        const jiraResponse = await technologyService.integrateWithJira(
          selectedJiraProject,
          initiativeData,
          jiraConfig
        );
        setJiraResult(jiraResponse);
        jiraSuccess = jiraResponse.success;
      }

      // Run Calendar integration if selected
      if (selectedIntegrations.calendar) {
        // Format training sessions for API
        const formattedSessions = trainingSessions.map((session) => {
          // Create ISO datetime strings
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

        // Call the API with your Google Calendar API key
        // The API key is hardcoded here but should be stored in an environment variable in production
        const calendarResponse =
          await integrationService.createCalendarEventsWithApiKey(
            initiativeData,
            formattedSessions,
            "AIzaSyDq_E1K3OoqaotMJ9nB21J-om0SGOavfnQ" // Your Google Calendar API key
          );

        setCalendarResult(calendarResponse);
        calendarSuccess = calendarResponse.success;
      }

      // Move to results step
      setStep("results");
    } catch (error) {
      console.error("Integration error:", error);
      setError("An error occurred during integration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onComplete({
      jiraIntegrated: jiraResult?.success || false,
      jiraDetails: jiraResult,
      calendarIntegrated: calendarResult?.success || false,
      calendarDetails: calendarResult,
    });
  };

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Would you like to integrate with other tools?
      </h2>
      <p className="text-gray-600">
        Connect your change initiative with project management and scheduling
        tools.
      </p>

      <div className="space-y-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
            selectedIntegrations.jira
              ? "border-primary-500 bg-primary-50"
              : "border-gray-200"
          }`}
          onClick={() => handleToggleIntegration("jira")}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                selectedIntegrations.jira
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {selectedIntegrations.jira && <CheckIcon className="w-4 h-4" />}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-800">Jira Integration</h3>
              <p className="text-sm text-gray-500">
                Create issues in Jira to track your change initiative
              </p>
            </div>
            <CodeIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div
          className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
            selectedIntegrations.calendar
              ? "border-primary-500 bg-primary-50"
              : "border-gray-200"
          }`}
          onClick={() => handleToggleIntegration("calendar")}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                selectedIntegrations.calendar
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {selectedIntegrations.calendar && (
                <CheckIcon className="w-4 h-4" />
              )}
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-gray-800">
                Google Calendar Integration
              </h3>
              <p className="text-sm text-gray-500">
                Schedule learning sessions in Google Calendar
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Configure Integrations
      </h2>

      {selectedIntegrations.jira && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-800">Jira Configuration</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jira Project
            </label>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedJiraProject}
              onChange={handleJiraProjectChange}
            >
              {jiraProjects.map((project) => (
                <option key={project.key} value={project.key}>
                  {project.name} ({project.key})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jira Base URL (optional)
            </label>
            <input
              type="text"
              name="baseUrl"
              value={jiraConfig.baseUrl}
              onChange={handleJiraConfigChange}
              placeholder="https://your-domain.atlassian.net"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to use your organization's default Jira instance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jira Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={jiraConfig.email}
                onChange={handleJiraConfigChange}
                placeholder="you@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Token (optional)
              </label>
              <input
                type="password"
                name="apiToken"
                value={jiraConfig.apiToken}
                onChange={handleJiraConfigChange}
                placeholder="••••••••••••••••"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            If you don't provide credentials, we'll simulate the Jira
            integration for demonstration.
          </p>
        </div>
      )}

      {selectedIntegrations.calendar && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-gray-800">
            Google Calendar Configuration
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Training Sessions
              </h4>
              <button
                type="button"
                onClick={addTrainingSession}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusCircleIcon className="w-4 h-4 mr-1" />
                Add Session
              </button>
            </div>

            {trainingSessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-md p-3 space-y-3 bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-gray-800">
                    Session {session.id}
                  </h5>
                  <button
                    type="button"
                    onClick={() => removeTrainingSession(session.id)}
                    disabled={trainingSessions.length <= 1}
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
                      handleTrainingSessionChange(
                        session.id,
                        "title",
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                        handleTrainingSessionChange(
                          session.id,
                          "date",
                          e.target.value
                        )
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          handleTrainingSessionChange(
                            session.id,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(e) =>
                          handleTrainingSessionChange(
                            session.id,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      handleTrainingSessionChange(
                        session.id,
                        "location",
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Office, Virtual Meeting, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={session.description}
                    onChange={(e) =>
                      handleTrainingSessionChange(
                        session.id,
                        "description",
                        e.target.value
                      )
                    }
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            ))}

            <p className="text-sm text-gray-500">
              These training sessions will be scheduled in Google Calendar with
              "Add to Calendar" links for attendees.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => setStep("options")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleRunIntegrations}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Run Integrations"}
        </button>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Integration Results
      </h2>

      {jiraResult && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-800">Jira Integration</h3>
          </div>

          <div className="bg-gray-50 p-3 rounded-md mb-3">
            <p className="text-sm text-gray-600">
              Successfully created Jira issues for{" "}
              <span className="font-medium">
                {initiativeData.initiative_name}
              </span>{" "}
              in project{" "}
              <span className="font-medium">{jiraResult.project_key}</span>
            </p>

            {jiraResult.mock && (
              <p className="text-xs text-amber-600 mt-1">
                This was a simulation. Connect with real Jira credentials for
                actual integration.
              </p>
            )}
          </div>

          <h4 className="font-medium text-sm text-gray-700 mb-2">
            Created Items:
          </h4>
          <ul className="space-y-2">
            {jiraResult.created_items &&
              jiraResult.created_items.map((item) => (
                <li key={item.key} className="flex items-center text-sm">
                  <span className="w-16 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                    {item.type}
                  </span>
                  <span className="text-gray-700">
                    {item.summary || item.key}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {calendarResult && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-800">
              Google Calendar Integration
            </h3>
          </div>

          <div className="bg-gray-50 p-3 rounded-md mb-3">
            <p className="text-sm text-gray-600">
              Successfully created calendar events for{" "}
              <span className="font-medium">
                {initiativeData.initiative_name}
              </span>
            </p>

            {calendarResult.add_to_calendar_links && (
              <p className="text-xs text-blue-600 mt-1">
                Calendar links are ready to be shared with attendees
              </p>
            )}
          </div>

          <h4 className="font-medium text-sm text-gray-700 mb-2">
            Scheduled Sessions:
          </h4>
          <ul className="space-y-3">
            {calendarResult.events &&
              calendarResult.events.map((event, index) => (
                <li key={index} className="bg-white border rounded-md p-2">
                  <div className="flex items-start">
                    <ClockIcon className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {event.formatted_date} •{" "}
                        {event.formatted_time || event.time || ""}
                      </p>
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-1 text-xs text-primary-600 hover:text-primary-800"
                        >
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          Add to Calendar
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={handleFinish}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Complete
        </button>
      </div>
    </div>
  );

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case "options":
        return renderOptionsStep();
      case "configure":
        return renderConfigureStep();
      case "results":
        return renderResultsStep();
      default:
        return renderOptionsStep();
    }
  };

  return <div className="bg-white p-6 rounded-lg shadow">{renderStep()}</div>;
};

export default IntegrationOptions;
