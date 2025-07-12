import React from "react";

export default function Pagination({ pageNo, size, total, onChange, theme }) {
  const totalPages = Math.ceil(total / size);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      onChange(newPage);
    }
  };

  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show max 5 page numbers at a time
    
    // Always show first page
    pages.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`px-3 py-1 border rounded ${
          pageNo === 1 ? "bg-blue-500 text-white" : ""
        }`}
      >
        1
      </button>
    );

    let startPage = Math.max(2, pageNo - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 2);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push(<span key="ellipsis1" className="px-2">...</span>);
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded ${
            pageNo === i ? "bg-blue-500 text-white" : ""
          }`}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push(<span key="ellipsis2" className="px-2">...</span>);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 border rounded ${
            pageNo === totalPages ? "bg-blue-500 text-white" : ""
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePageChange(pageNo - 1)}
        disabled={pageNo === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => handlePageChange(pageNo + 1)}
        disabled={pageNo === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
