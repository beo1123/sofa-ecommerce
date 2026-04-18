import ExcelJS from "exceljs";

export async function readExcel<T = Record<string, unknown>>(filePath: string): Promise<T[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return [];
  }

  const rows: T[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // First row is headers
      row.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value ?? "");
      });
    } else {
      // Data rows
      const rowData: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value ?? null;
        }
      });
      rows.push(rowData as T);
    }
  });

  return rows;
}
