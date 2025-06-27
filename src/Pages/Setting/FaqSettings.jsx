import React from "react";
import { useSelector } from "react-redux";
import { useTheme } from "../../contexts/theme/hook/useTheme";
import DataTable from "../../Component/Table/DataTable";

export default function FaqSettings() {
  const { theme } = useTheme();

  const faqs = useSelector((state) => state.setting?.faqs?.faqs || []);

  const columns = [
    {
      key: "name",
      label: "FAQ Title",
      width: "30%",
    },
    {
      key: "value",
      label: "FAQ Answer",
      width: "60%",
    },
  ];

  return (
    <div className="p-4 space-y-4" style={{ backgroundColor: theme.colors.background }}>
      <h1
        className="text-xl font-semibold"
        style={{ color: theme.colors.textPrimary }}
      >
        FAQ Settings
      </h1>

      <DataTable columns={columns} data={faqs} />
    </div>
  );
}
