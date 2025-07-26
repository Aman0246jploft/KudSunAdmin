import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardCount } from "../../features/slices/userSlice";
import { useTheme } from "../../contexts/theme/hook/useTheme"; // import theme hook
import MonthlyDashboardCharts from "./MonthlyDashboardCharts";

export default function Dashboard() {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state?.user);
  const { loading, error, getDashboardSummary = {} } = selector || {};
  const { theme } = useTheme(); // get theme

  useEffect(() => {
    dispatch(getDashboardCount()).catch((err) => {
      console.error("Failed to fetch dashboard summary:", err);
    });
  }, [dispatch]);

  const stats = [
    { title: "Total Users", value: getDashboardSummary.totalUsers || 0 },
    { title: "Total Threads", value: getDashboardSummary.totalThreads || 0 },
    {
      title: "Total Products",
      value: getDashboardSummary.totalFixedProducts || 0,
    },
    { title: "Live Auctions", value: getDashboardSummary.liveAuctions || 0 },
  ];

  return (
    <div
      className="p-6"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="shadow-md rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              boxShadow: `0 2px 8px ${
                theme.colors.shadow || "rgba(0,0,0,0.1)"
              }`,
            }}
          >
            <div
              className="text-xl font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              {stat.title}
            </div>
            <div
              className="text-3xl font-bold mt-2"
              style={{ color: theme.colors.textPrimary }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>



      <MonthlyDashboardCharts/>
    </div>
  );
}
