import React, { useState } from "react";
import { useTheme } from "../../contexts/theme/hook/useTheme";

const DataTable = ({ columns, data = [], sortBy, sortOrder, onSort }) => {
  const { theme } = useTheme();
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });

  const handleSort = (col) => {
    if (!col.sortable || !onSort) return;

    const newSortBy = col.sortKey || col.key;
    const newSortOrder =
      sortBy === newSortBy ? (sortOrder === "asc" ? "desc" : "asc") : "asc";

    onSort(newSortBy, newSortOrder);
  };

  const handleMouseEnter = (e, value) => {
    if (value && String(value).length > 30) {
      const rect = e.target.getBoundingClientRect();
      setTooltip({
        visible: true,
        content: String(value),
        x: rect.left,
        y: rect.top - 10,
      });
    }
  };

  const handleMouseLeave = (e) => {
    const related = e.relatedTarget;
    if (!related || !related.closest(".custom-tooltip")) {
      setTooltip({ visible: false, content: "", x: 0, y: 0 });
    }
  };

  const getCellContent = (col, row, rowIndex) => {
    if (col.render) {
      return col.render(row[col.key], row, rowIndex);
    }

    const value = row[col.key];
    if (value === undefined || value === null) {
      return "-";
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table
          className="min-w-full text-sm text-left table-fixed border"
          style={{ borderColor: theme.colors.border }}
        >
          <thead style={{ backgroundColor: theme.colors.tertiary }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-2 font-medium border-b"
                  style={{
                
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderLight,
                    width: col.width || "auto",
                    ...col.headerStyle,
                  }}
                >
                  <div
                    className={`flex items-center gap-1 select-none ${
                      col.headerStyle?.textAlign === "right" ? "justify-end" : ""
                    }`}
                    onClick={() => handleSort(col)}
                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                  >
                    {col.label}
                    {col.sortable && sortBy === (col.sortKey || col.key) && (
                      <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center"
                  style={{ color: theme.colors.textSecondary }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data?.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-opacity-75"
                  style={{
                    borderBottom: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {columns.map((col) => {
                    const content = getCellContent(col, row, rowIndex);
                    return (
                      <td
                        key={col.key}
                        className="p-2 max-w-[200px] truncate align-top"
                        style={{
                          ...col.cellStyle,
                        }}
                        onMouseEnter={(e) => {
                          if (!col.disableTooltip) handleMouseEnter(e, row[col.key]);
                        }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="truncate">{content}</div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {tooltip.visible && (
        <div
          className="fixed z-[9999] pointer-events-auto custom-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: "translateY(-100%)",
          }}
          onMouseEnter={() =>
            setTooltip((prev) => ({ ...prev, visible: true }))
          }
          onMouseLeave={() =>
            setTooltip({ visible: false, content: "", x: 0, y: 0 })
          }
        >
          <div
            className="absolute left-3 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
            style={{
              borderTopColor: theme.colors.background,
            }}
          />
          <div
            className="text-sm p-3 break-words whitespace-normal shadow-xl max-w-xs rounded-lg"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              maxWidth: "300px",
              backgroundColor: theme.colors.background,
              // backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.borderLight}`,
              padding: "8px",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              whiteSpace: "pre-wrap",
              overflowY: "auto",
              maxHeight: "5.5em", // approx. 4 lines (1.375em per line)
              lineHeight: "1.375em",
            }}
          >
            {tooltip.content}
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;
