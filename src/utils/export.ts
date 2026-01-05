/**
 * Client-side export utilities
 */

/**
 * Export data to CSV and download
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get headers from first object keys
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.map((h) => `"${h}"`).join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header] ?? "";
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

