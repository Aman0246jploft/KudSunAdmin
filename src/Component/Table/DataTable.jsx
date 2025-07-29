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
    if (!related || !related?.closest(".custom-tooltip")) {
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
    <div>
      {/* Desktop/Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto ">
        <table
          className="min-w-full text-sm text-left table-fixed border"
          style={{ borderColor: theme.colors.border }}
        >
          <thead style={{ backgroundColor: theme.colors.tertiary }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-2 md:p-3 font-medium border-b text-xs sm:text-sm"
                  style={{
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderLight,
                    width: col.width || "auto",
                    ...col.headerStyle,
                  }}
                >
                  <div
                    className={`flex items-center gap-1 select-none ${col.headerStyle?.textAlign === "right" ? "justify-end pr-2" : ""
                      }`}
                    onClick={() => handleSort(col)}
                    style={{ cursor: col.sortable ? "pointer" : "default" }}
                  >
                    <span className="truncate">{col.label}</span>
                    {col.sortable && sortBy === (col.sortKey || col.key) && (
                      <span className="flex-shrink-0">{sortOrder === "asc" ? "▲" : "▼"}</span>
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
                        className="p-2 md:p-3 max-w-[120px] sm:max-w-[150px] md:max-w-[200px] truncate align-top text-xs sm:text-sm"
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

      {/* Mobile Card View */}
      <div className="block sm:hidden w-full">
        {data?.length === 0 ? (
          <div
            className="p-4 text-center border rounded-lg"
            style={{
              color: theme.colors.textSecondary,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background
            }}
          >
            No data available
          </div>
        ) : (
          <div className="space-y-3">
            {data?.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="border rounded-lg overflow-hidden"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                }}
              >
                {columns.map((col, colIndex) => {
                  const content = getCellContent(col, row, rowIndex);
                  const value = row[col.key];

                  return (
                    <div
                      key={col.key}
                      className={`p-3 flex justify-between items-start gap-2 ${colIndex !== columns.length - 1 ? 'border-b' : ''
                        }`}
                      style={{
                        borderColor: theme.colors.borderLight,
                      }}
                    >
                      <div className="flex-shrink-0 min-w-0 w-1/3">
                        <div
                          className="font-medium text-xs uppercase tracking-wide truncate"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {col.label}
                          {col.sortable && sortBy === (col.sortKey || col.key) && (
                            <span
                              className="ml-1 cursor-pointer"
                              onClick={() => handleSort(col)}
                            >
                              {sortOrder === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex-1 min-w-0 text-right"
                        onMouseEnter={(e) => {
                          if (!col.disableTooltip) handleMouseEnter(e, value);
                        }}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div
                          className="text-sm  text-right  break-words"
                          style={{
                            color: theme.colors.textPrimary,
                            ...col.cellStyle
                          }}
                        >
                          {content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Responsive Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-[9999] pointer-events-auto custom-tooltip"
          style={{
            left: `${Math.min(tooltip.x, window.innerWidth - 320)}px`,
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
            className="text-xs sm:text-sm p-2 sm:p-3 break-words whitespace-normal shadow-xl rounded-lg"
            style={{
              maxWidth: "280px",
              backgroundColor: theme.colors.background,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.borderLight}`,
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              whiteSpace: "pre-wrap",
              overflowY: "auto",
              maxHeight: "5.5em",
              lineHeight: "1.375em",
            }}
          >
            {tooltip.content}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;