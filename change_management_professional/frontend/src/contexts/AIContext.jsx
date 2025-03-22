import React, { createContext, useState, useContext, useCallback } from "react";

// Create the AI context
const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [preferences, setPreferences] = useState({
    framework: "adkar",
    proactiveSuggestions: true,
    learnFromFeedback: true,
    detailLevel: "balanced",
    language: "en",
  });

  // Function to send a message to the AI and get a response
  const sendMessage = useCallback(async (message, conversationId = null) => {
    setIsProcessing(true);

    try {
      // In a real app, this would make an API call to your AI backend
      // For this demo, we'll simulate an AI response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple response mapping based on keywords (simulating AI)
      const aiResponses = {
        "adkar":
          "Using the ADKAR model, I recommend focusing on building awareness first. Ensure all stakeholders understand why this change is necessary and what benefits it will bring.",
        "communication":
          "Your communication plan should include clear messaging about the rationale for change, the impact on stakeholders, and the expected timeline. Consider using multiple channels to reach all affected parties.",
        "resistance":
          "To manage resistance, I recommend creating forums for feedback, addressing concerns transparently, and identifying change champions who can help influence their peers.",
        "stakeholder":
          "For effective stakeholder management, start by mapping all stakeholders based on their influence and interest in the change. Develop targeted engagement strategies for each group.",
        "feedback":
          "Based on previous similar changes, collecting regular feedback through surveys and focus groups has proven most effective. This creates a continuous improvement loop.",
        "framework":
          "The ADKAR framework consists of five elements: Awareness, Desire, Knowledge, Ability, and Reinforcement. Each element represents a milestone individuals must achieve for change to be successful.",
      };

      // Generate a default response
      let aiResponse =
        "I can help you with that change management initiative. Could you provide more specific details about your current situation or what aspect you need help with?";

      // Check for keywords in the message
      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (message.toLowerCase().includes(keyword)) {
          aiResponse = response;
          break;
        }
      }

      // Create new message objects
      const userMessageObj = {
        id: Date.now(),
        text: message,
        sender: "user",
        timestamp: new Date(),
      };

      const aiMessageObj = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      // Update conversations
      if (conversationId) {
        // Add to existing conversation
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessageObj, aiMessageObj],
                }
              : conv
          )
        );
      } else {
        // Create new conversation
        const newConversation = {
          id: Date.now().toString(),
          title:
            message.length > 30 ? `${message.substring(0, 30)}...` : message,
          messages: [userMessageObj, aiMessageObj],
          createdAt: new Date(),
        };

        setConversations((prev) => [...prev, newConversation]);
        return newConversation.id;
      }

      return aiMessageObj;
    } catch (error) {
      console.error("Error sending message to AI:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Function to get conversation by ID
  const getConversation = useCallback(
    (conversationId) => {
      return conversations.find((conv) => conv.id === conversationId) || null;
    },
    [conversations]
  );

  // Function to update AI preferences
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  // Function to delete a conversation
  const deleteConversation = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.filter((conv) => conv.id !== conversationId)
    );
  }, []);

  // Function to provide feedback on an AI message
  const provideFeedback = useCallback((messageId, isHelpful) => {
    // In a real app, this would send feedback to your API to improve the model
    console.log(
      `Feedback provided for message ${messageId}: ${
        isHelpful ? "Helpful" : "Not helpful"
      }`
    );
    // Here you would likely update the message in state to show the feedback was received
  }, []);

  // Function to generate a specific type of content or recommendation
  const generateContent = useCallback(async (contentType, parameters = {}) => {
    setIsProcessing(true);

    try {
      // In a real app, this would call your AI backend with specific instructions
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock responses based on content type
      const mockResponses = {
        "communication_plan":
          "Here is a communication plan template customized for your organizational change...",
        "stakeholder_map":
          "Based on the information provided, here is a stakeholder influence/interest matrix...",
        "resistance_strategies":
          "Here are recommended strategies to address resistance in your organization...",
        "adkar_assessment":
          "Based on your inputs, here is an ADKAR assessment of your organization's readiness...",
      };

      return {
        success: true,
        content:
          mockResponses[contentType] || "Generated content would appear here.",
        metadata: { timestamp: new Date(), parameters },
      };
    } catch (error) {
      console.error("Error generating content:", error);
      return { success: false, error: "Failed to generate content" };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const value = {
    isProcessing,
    conversations,
    preferences,
    sendMessage,
    getConversation,
    updatePreferences,
    deleteConversation,
    provideFeedback,
    generateContent,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};

export default AIContext;
