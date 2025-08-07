import * as XLSX from 'xlsx';

// Utility function to convert data to CSV
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const csvContent = convertToCSV(data);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Utility function to export to Excel
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Convert array of objects to CSV string
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      let value = row[header];
      
      // Handle nested objects and arrays
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value = value.join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }
      
      // Escape commas and quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      
      return value ?? '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

// Download file
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Format user data for export
export const formatUserDataForExport = (users) => {
  return users.map((user, index) => ({
    'S.No': index + 1,
    'User Name': user.userName || '-',
    'Email': user.email || '-',
    'Phone Number': user.phoneNumber || '-',
    'Gender': user.gender || '-',
    'Location': `${user.userAddress?.province?.name || ''} ${user.userAddress?.district?.name || ''}`.trim() || 'Not Found',
    'Date of Birth': user.dob ? new Date(user.dob).toLocaleDateString('en-GB') : '-',
    'Preferred Seller': user.is_Preferred_seller ? 'Yes' : 'No',
    'Status': user.isDisable ? 'Inactive' : 'Active',
    'Registration Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : '-',
    'Seller Verification Status': user.sellerVerificationStatus || '-',
    'Report Count': user.reportCount || 0,
    'Is Flagged': user.isFlagedReported ? 'Yes' : 'No'
  }));
};

// Format product data for export
export const formatProductDataForExport = (products) => {
  return products.map((product, index) => ({
    'S.No': index + 1,
    'Title': product.title || '-',
    'Description': product.description || '-',
    'Category': product.categoryId?.name || 'N/A',
    'Sub Category': product.subCategoryName || 'N/A',
    'Price': product.fixedPrice || '-',
    'Status': product.isDisable ? 'Inactive' : 'Active',
    'Seller': product.userId?.userName || '-',
    'Seller Email': product.userId?.email || '-',
    'Creation Date': product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-GB') : '-',
    'Tags': Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '-'),
    'Shipping Type': product.deliveryOption || '-',
    'Views': product.viewCount || 0,
    'Likes': product.likeCount || 0
  }));
};

// Format auction data for export
export const formatAuctionDataForExport = (auctions) => {
  return auctions.map((auction, index) => ({
    'S.No': index + 1,
    'Title': auction.title || '-',
    'Description': auction.description || '-',
    'Category': auction.categoryId?.name || 'N/A',
    'Sub Category': auction.subCategoryName || 'N/A',
    'Current Bid': auction.highestBidAmount || 0,
    'Starting Price': auction.startingPrice || '-',
    'Status': auction.isDisable ? 'Inactive' : 'Active',
    'Seller': auction.userId?.userName || '-',
    'Seller Email': auction.userId?.email || '-',
    'Creation Date': auction.createdAt ? new Date(auction.createdAt).toLocaleDateString('en-GB') : '-',
    'End Date': auction.endDate ? new Date(auction.endDate).toLocaleDateString('en-GB') : '-',
    'Total Bids': auction.bidCount || 0,
    'Tags': Array.isArray(auction.tags) ? auction.tags.join(', ') : (auction.tags || '-'),
    'Shipping Type': auction.deliveryOption || '-'
  }));
};

// Format thread data for export
export const formatThreadDataForExport = (threads) => {
  return threads.map((thread, index) => ({
    'S.No': index + 1,
    'Title': thread.title || '-',
    'Description': thread.description || '-',
    'Category': thread.categoryId?.name || 'N/A',
    'Sub Category': thread.subCategoryId || 'N/A',
    'Total Products': thread.totalAssociatedProducts || 0,
    'Status': thread.isDisable ? 'Inactive' : 'Active',
    'Creator': thread.userId?.userName || '-',
    'Creator Email': thread.userId?.email || '-',
    'Creation Date': thread.createdAt ? new Date(thread.createdAt).toLocaleDateString('en-GB') : '-',
    'Budget Range': thread.budget ? `${thread.minBudget || 0} - ${thread.maxBudget || 0}` : '-',
    'Tags': Array.isArray(thread.tags) ? thread.tags.join(', ') : (thread.tags || '-'),
    'Views': thread.viewCount || 0,
    'Replies': thread.replyCount || 0
  }));
};

// Generate filename with current date
export const generateFilename = (baseName, filters = {}) => {
  const date = new Date().toISOString().split('T')[0];
  const hasFilters = Object.values(filters).some(value => 
    value !== "" && value !== null && value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : true)
  );
  
  const suffix = hasFilters ? '_filtered' : '';
  return `${baseName}_${date}${suffix}`;
}; 