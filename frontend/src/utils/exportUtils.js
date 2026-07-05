import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

/**
 * Exports data to an Excel (.xlsx) file with multiple sheets.
 * @param {Object} sheetsData - An object where keys are sheet names and values are arrays of objects (the data).
 * @param {string} filename - The name of the downloaded file (without extension).
 */
export const exportToExcel = (sheetsData, filename) => {
    try {
        const wb = XLSX.utils.book_new();

        Object.keys(sheetsData).forEach(sheetName => {
            const data = sheetsData[sheetName];
            if (data && data.length > 0) {
                // Ensure sheet name is 31 characters or less
                const safeSheetName = sheetName.substring(0, 31);
                const ws = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
            }
        });

        if (wb.SheetNames.length === 0) {
            toast.error('No valid data available to export');
            return;
        }

        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success(`Successfully exported ${filename}`);
    } catch (err) {
        console.error('Error exporting to Excel:', err);
        toast.error('Failed to export data');
    }
};

/**
 * Exports data to a CSV file.
 * @param {Array} data - Array of objects containing the data.
 * @param {string} filename - The name of the downloaded file (without extension).
 */
export const exportToCSV = (data, filename) => {
    try {
        if (!data || data.length === 0) {
            toast.error('No valid data available to export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Successfully exported ${filename}`);
    } catch (err) {
        console.error('Error exporting to CSV:', err);
        toast.error('Failed to export data');
    }
};
