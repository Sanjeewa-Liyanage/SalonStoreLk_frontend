import Papa from 'papaparse';

export interface ExportData {
  columns: string[];
  rows: Record<string, any>[];
}

/**
 * Export data as CSV
 */
export const exportToCSV = (data: ExportData, filename: string = 'export.csv') => {
  try {
    const csv = Papa.unparse({
      fields: data.columns,
      data: data.rows.map((row) =>
        data.columns.reduce((acc, col) => {
          acc[col] = row[col];
          return acc;
        }, {} as Record<string, any>)
      ),
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Export data as JSON
 */
export const exportToJSON = (data: ExportData, filename: string = 'export.json') => {
  try {
    const jsonData = JSON.stringify(data.rows, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
  }
};

/**
 * Export data as PDF
 */
export const exportToPDF = async (data: ExportData, filename: string = 'export.pdf') => {
  try {
    // Dynamic import to avoid issues with server-side rendering
    const html2pdf = (await import('html2pdf.js')).default;

    // Create HTML table
    const headers = data.columns.map((col) => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${col}</th>`).join('');
    const rows = data.rows
      .map(
        (row) =>
          `<tr>${data.columns
            .map(
              (col) =>
                `<td style="border: 1px solid #ddd; padding: 8px;">${row[col] || '-'}</td>`
            )
            .join('')}</tr>`
      )
      .join('');

    const html = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const element = document.createElement('div');
    element.innerHTML = html;

    const options = {
      margin: 10,
      filename: filename,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};
