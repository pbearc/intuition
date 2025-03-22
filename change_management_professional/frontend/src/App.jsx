import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import Dashboard from "./pages/Dashboard";
import ChangeAssistant from "./pages/ChangeAssistant";
import KnowledgeHub from "./pages/KnowledgeHub";
import PastCampaigns from "./pages/PastCampaigns";
import Settings from "./pages/Settings";
import { AuthProvider } from "./contexts/AuthContext";
import { AIProvider } from "./contexts/AIContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <AIProvider>
          <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
              <main className="flex-1 overflow-y-auto p-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assistant" element={<ChangeAssistant />} />
                  <Route path="/knowledge" element={<KnowledgeHub />} />
                  <Route path="/campaigns" element={<PastCampaigns />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </AIProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
