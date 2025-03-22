import React, { useState } from "react";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/outline";
import technologyService from "../../services/technologyService";
import IntegrationOptions from "../integration/IntegrationOptions";

// This is a simplified version of what the NewChangeInitiative component might look like
const NewChangeInitiative = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    initiative_name: "",
    initiative_description: "",
    technology_type: "",
    departments: [],
    current_systems: "",
    new_systems: "",
    start_date: "",
    end_date: "",
    stakeholders: [],
    integrations: {
      jiraIntegrated: false,
      jiraDetails: null,
      calendarIntegrated: false,
      calendarDetails: null,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setFormData({
      ...formData,
      [name]: selectedValues,
    });
  };

  const handleIntegrationComplete = (integrationResults) => {
    setFormData({
      ...formData,
      integrations: integrationResults,
    });

    // Move to the final step
    setStep(5);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await technologyService.createTechnologyChange(formData);

      // If we were on the integration step and skipped, move to final step
      if (step === 4) {
        setStep(5);
      } else {
        onComplete(result);
      }
    } catch (err) {
      console.error("Error creating change initiative:", err);
      setError("Failed to create change initiative. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Basic validation before proceeding
    if (
      step === 1 &&
      (!formData.initiative_name || !formData.initiative_description)
    ) {
      setError("Please enter both name and description.");
      return;
    }

    if (step === 3) {
      // Submit the form data to create the change initiative
      handleSubmit();
    } else {
      // Just go to next step
      setStep(step + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError(null);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Change Initiative Name
          </label>
          <input
            type="text"
            name="initiative_name"
            value={formData.initiative_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., CRM Implementation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="initiative_description"
            value={formData.initiative_description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Describe the change initiative..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Technology Type
          </label>
          <select
            name="technology_type"
            value={formData.technology_type}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="">Select a type...</option>
            <option value="crm">CRM System</option>
            <option value="erp">ERP System</option>
            <option value="cloud">Cloud Migration</option>
            <option value="collaboration">Collaboration Tools</option>
            <option value="security">Security Systems</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAdditionalDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Additional Details
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Affected Departments
          </label>
          <select
            name="departments"
            multiple
            value={formData.departments}
            onChange={handleMultiSelectChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="it">IT</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="operations">Operations</option>
            <option value="customer_service">Customer Service</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Hold Ctrl or Cmd to select multiple options
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Systems
          </label>
          <input
            type="text"
            name="current_systems"
            value={formData.current_systems}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Current technology or systems being replaced"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Systems
          </label>
          <input
            type="text"
            name="new_systems"
            value={formData.new_systems}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="New technology or systems being implemented"
          />
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Timeline</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Key Stakeholders
          </label>
          <select
            name="stakeholders"
            multiple
            value={formData.stakeholders}
            onChange={handleMultiSelectChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="executives">Executives</option>
            <option value="managers">Department Managers</option>
            <option value="employees">Employees</option>
            <option value="customers">Customers</option>
            <option value="vendors">Vendors/Partners</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Hold Ctrl or Cmd to select multiple options
          </p>
        </div>
      </div>
    </div>
  );

  const renderIntegrationOptions = () => (
    <IntegrationOptions
      initiativeData={formData}
      onComplete={handleIntegrationComplete}
      onCancel={() => setStep(5)} // Skip to final step if canceled
    />
  );

  const renderFinalStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">All Set!</h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Change initiative created successfully
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your change initiative "{formData.initiative_name}" has been
                registered.
              </p>
            </div>
          </div>
        </div>
      </div>

      {(formData.integrations.jiraIntegrated ||
        formData.integrations.calendarIntegrated) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Integrations Summary
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            {formData.integrations.jiraIntegrated && (
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Connected to Jira project{" "}
                {formData.integrations.jiraDetails?.project_key}
              </li>
            )}
            {formData.integrations.calendarIntegrated && (
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Learning sessions scheduled in Google Calendar
              </li>
            )}
          </ul>
        </div>
      )}

      <p className="text-gray-600">What would you like to do next?</p>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => onComplete(formData)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Create Another Initiative
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderAdditionalDetails();
      case 3:
        return renderTimeline();
      case 4:
        return renderIntegrationOptions();
      case 5:
        return renderFinalStep();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            "Basic Info",
            "Details",
            "Timeline",
            "Integrations",
            "Complete",
          ].map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === step;
            const isComplete = stepNumber < step;

            return (
              <div
                key={label}
                className={`flex flex-col items-center ${
                  index < 4 ? "w-1/4" : ""
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : isComplete
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isActive ? "text-primary-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {label}
                </div>
                {index < 4 && (
                  <div
                    className={`w-full h-0.5 mt-3 ${
                      stepNumber < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStepContent()}</div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className={`inline-flex items-center px-4 py-2 border ${
              step === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } bg-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50`}
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {step === 3 ? (
              loading ? (
                "Creating..."
              ) : (
                "Create & Continue"
              )
            ) : (
              <>
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewChangeInitiative;
