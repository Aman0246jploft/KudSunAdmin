import React, { useState } from "react";
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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Sample multi-year data
const rawData = {
  2023: {
    users: { Jan: 100, Feb: 120, Mar: 130, May: 90, Jul: 160, Dec: 180 },
    revenue: { Jan: 4000, Feb: 4200, Mar: 4100, May: 3900, Jul: 5000, Dec: 6000 },
    productsSold: { Jan: 60, Feb: 75, Mar: 90, May: 50, Jul: 100, Dec: 120 }
  },
  2024: {
    users: { Jan: 150, Feb: 180, Mar: 200, Apr: 210, Jun: 170, Sep: 250, Dec: 300 },
    revenue: { Jan: 5000, Feb: 5400, Mar: 6000, Apr: 5800, Jun: 5300, Sep: 6500, Dec: 8000 },
    productsSold: { Jan: 100, Feb: 120, Mar: 140, Apr: 130, Jun: 125, Sep: 180, Dec: 200 }
  }
};

// Helper to normalize data per month
const formatYearlyData = (yearData) =>
  MONTHS.map((month) => ({
    month,
    users: yearData.users[month] || 0,
    revenue: yearData.revenue[month] || 0,
    productsSold: yearData.productsSold[month] || 0
  }));

const MonthlyDashboardCharts = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const data = formatYearlyData(rawData[selectedYear]);

  const years = Object.keys(rawData).sort();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monthly Dashboard</h1>
        <select
          className="border rounded px-3 py-1 text-sm  "
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="bg-white  p-4 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Users (Monthly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "Users", angle: -90, position: "insideLeft" }} />
              <Tooltip />
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip formatter={(value) => `$${value}`} />
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
              <YAxis label={{ value: "Products Sold", angle: -90, position: "insideLeft" }} />
              <Tooltip />
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
