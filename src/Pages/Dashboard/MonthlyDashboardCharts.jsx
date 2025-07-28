import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getMonthlyAnalytics,
  getAvailableYears,
  setSelectedYear
} from "../../features/slices/dashboardSlice";

const MonthlyDashboardCharts = () => {
  const dispatch = useDispatch();
  const {
    monthlyAnalytics,
    availableYears,
    selectedYear,
    loading,
    error
  } = useSelector((state) => state.dashboard);

  const formatNumber = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };


  // Initialize component
  useEffect(() => {
    dispatch(getAvailableYears());
  }, [dispatch]);

  // Fetch data when year changes
  useEffect(() => {
    if (selectedYear) {
      dispatch(getMonthlyAnalytics(selectedYear));
    }
  }, [dispatch, selectedYear]);

  // Handle year change
  const handleYearChange = (year) => {
    dispatch(setSelectedYear(year));
  };

  // Format data for charts
  const formatChartData = () => {
    if (!monthlyAnalytics) return [];

    const { users, revenue, productsSold } = monthlyAnalytics;

    return users?.map((userItem, index) => ({
      month: userItem.month,
      users: userItem.users || 0,
      revenue: revenue?.[index]?.revenue || 0,
      productsSold: productsSold?.[index]?.productsSold || 0
    })) || [];
  };

  const data = formatChartData();

  // Loading state
  if (loading && !monthlyAnalytics) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !monthlyAnalytics) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading dashboard data: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monthly Dashboard</h1>
        <div className="flex items-center gap-2">
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          <select
            className="border rounded px-3 py-1 text-sm"
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            disabled={loading}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="bg-white  p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Users (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Users", angle: -90, position: "insideLeft" }} tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />

              <Legend />
              <Bar dataKey="users" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white  p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Revenue (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{ value: "Revenue", angle: -90, position: "insideLeft" }}
                tickFormatter={formatNumber}
              />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Products Sold Chart */}
        <div className="bg-white  p-4 rounded-2xl shadow lg:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Total Products Sold (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Products Sold", angle: -90, position: "insideLeft" }} tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="productsSold" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyDashboardCharts;
