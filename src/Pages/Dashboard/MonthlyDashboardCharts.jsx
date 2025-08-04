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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getMonthlyAnalytics,
  setSelectedYear,
} from "../../features/slices/dashboardSlice";

const MonthlyDashboardCharts = () => {
  const dispatch = useDispatch();
  const {
    monthlyAnalytics,
    selectedYear,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  // Local fallback for selectedYear
  const currentYear = new Date().getFullYear();

  // Set initial year on mount if not already set
  useEffect(() => {
    if (!selectedYear) {
      dispatch(setSelectedYear(currentYear));
    }
  }, [dispatch, selectedYear]);

  // Fetch data when year changes
  useEffect(() => {
    if (selectedYear) {
      dispatch(getMonthlyAnalytics(selectedYear));
    }
  }, [dispatch, selectedYear]);

  const handleYearChange = (date) => {
    const year = date.getFullYear();
    dispatch(setSelectedYear(year));
  };

  const formatNumber = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  const formatChartData = () => {
    if (!monthlyAnalytics) return [];

    const { users, revenue, productsSold } = monthlyAnalytics;

    return users?.map((userItem, index) => ({
      month: userItem.month,
      users: userItem.users || 0,
      revenue: revenue?.[index]?.revenue || 0,
      productsSold: productsSold?.[index]?.productsSold || 0,
    })) || [];
  };

  const data = formatChartData();

  if (loading && !monthlyAnalytics) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

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
          <DatePicker
            selected={selectedYear ? new Date(selectedYear, 0) : null}
            onChange={handleYearChange}
            showYearPicker
            dateFormat="yyyy"
            className="border rounded px-3 py-1 text-sm cursor-pointer"
            placeholderText="Select Year"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white  p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Users (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Users",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={formatNumber}
              />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="users" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white  p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Revenue (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Revenue",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={formatNumber}
              />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white  p-4 rounded-2xl shadow lg:col-span-2">
          <h2 className="text-xl font-semibold mb-2">
            Total Products Sold (Monthly)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                label={{
                  value: "Products Sold",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={formatNumber}
              />
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
