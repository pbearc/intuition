import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const EmployeeEngagement = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchDashboardData();
  }, []);

  const fetchDepartments = async () => {
    // Mock departments data
    const mockDepartments = [
      "Research & Development",
      "Medical Affairs",
      "Human Resources",
      "Clinical Research",
      "Manufacturing",
      "Sales & Marketing",
      "Finance",
      "Information Technology",
    ];
    setDepartments(mockDepartments);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock API response for dashboard data
      const mockData = {
        totalSessions: 13452,
        totalDurationInHours: 4587,
        averageSessionDuration: 30, // 30 minutes
        employeeEngagement: {
          "1": {
            name: "Hanyu",
            engagementScore: 85,
            uniqueServiceCount: 10,
            totalDuration: 18000,
          },
          "2": {
            name: "Jia Yee",
            engagementScore: 90,
            uniqueServiceCount: 12,
            totalDuration: 20000,
          },
          "3": {
            name: "Alice Johnson",
            engagementScore: 75,
            uniqueServiceCount: 8,
            totalDuration: 15000,
          },
          "4": {
            name: "Bob Lee",
            engagementScore: 80,
            uniqueServiceCount: 10,
            totalDuration: 16000,
          },
          "5": {
            name: "Charlie Brown",
            engagementScore: 95,
            uniqueServiceCount: 15,
            totalDuration: 22000,
          },
        },
        serviceUsage: {
          "1": {
            name: "ChatGPT",
            category: "Collaboration",
            sessions: 1200,
            uniqueUserCount: 300,
            totalDuration: 180000,
          },
          "2": {
            name: "DALL-E",
            category: "Communication",
            sessions: 950,
            uniqueUserCount: 250,
            totalDuration: 140000,
          },
          "3": {
            name: "Notion",
            category: "Time Management",
            sessions: 800,
            uniqueUserCount: 200,
            totalDuration: 120000,
          },
          "4": {
            name: "Slack",
            category: "Collaboration",
            sessions: 600,
            uniqueUserCount: 180,
            totalDuration: 100000,
          },
          "5": {
            name: "Microsoft Teams",
            category: "Learning",
            sessions: 400,
            uniqueUserCount: 120,
            totalDuration: 60000,
          },
          "6": {
            name: "Miro",
            category: "Learning",
            sessions: 400,
            uniqueUserCount: 120,
            totalDuration: 60000,
          },
        },
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchDashboardData();
  };

  const formatTopServices = () => {
    if (!dashboardData) return [];

    return Object.values(dashboardData.serviceUsage)
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5)
      .map((service) => ({
        name: service.name,
        sessions: service.sessions,
        users: service.uniqueUserCount,
        hours: Math.floor(service.totalDuration / 3600),
      }));
  };

  const formatTopEmployees = () => {
    if (!dashboardData) return [];

    return Object.values(dashboardData.employeeEngagement)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5)
      .map((employee) => ({
        name: employee.name,
        score: parseFloat(employee.engagementScore),
        services: employee.uniqueServiceCount,
        hours: Math.floor(employee.totalDuration / 3600),
      }));
  };

  const getServiceCategoryDistribution = () => {
    if (!dashboardData) return [];

    const categories = {};

    Object.values(dashboardData.serviceUsage).forEach((service) => {
      if (!categories[service.category]) {
        categories[service.category] = { name: service.category, sessions: 0 };
      }
      categories[service.category].sessions += service.sessions;
    });

    return Object.values(categories);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        Employee Service Engagement Dashboard
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              Department
            </label>
            <select
              className="w-full border rounded p-2"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              onClick={handleFilterChange}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm">Total Sessions</h3>
                <Users size={20} className="text-blue-500" />
              </div>
              <p className="text-2xl font-semibold">
                {dashboardData.totalSessions}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Service sessions in selected period
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm">Total Hours</h3>
                <Clock size={20} className="text-green-500" />
              </div>
              <p className="text-2xl font-semibold">
                {dashboardData.totalDurationInHours}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Hours spent across all services
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm">Avg Session Length</h3>
                <Activity size={20} className="text-orange-500" />
              </div>
              <p className="text-2xl font-semibold">
                {Math.floor(dashboardData.averageSessionDuration / 60)} min
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Average duration per session
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-500 text-sm">Active Employees</h3>
                <Users size={20} className="text-purple-500" />
              </div>
              <p className="text-2xl font-semibold">
                {Object.keys(dashboardData.employeeEngagement).length}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                Employees using services
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Services Chart */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-4">Top Services by Usage</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatTopServices()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Engagement Chart */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-4">Employee Engagement</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatTopEmployees()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Service Category Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Service Category Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getServiceCategoryDistribution()}
                    dataKey="sessions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default EmployeeEngagement;
