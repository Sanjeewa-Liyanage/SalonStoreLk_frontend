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

