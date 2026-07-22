/**
 * Shared spreadsheet response for the export routes (admin + host).
 * Default is a real .xlsx workbook (styled header, frozen row, sized
 * columns) so it opens straight into columns in Excel; format="csv" keeps a
 * plain-CSV path for imports into other tools.
 */

export type SheetCell = string | number;

export function toCsv(header: string[], rows: SheetCell[][]): string {
  return [header, ...rows]
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}

export async function sheetResponse(opts: {
  sheetName: string;
  filename: string; // without extension
  header: string[];
  rows: SheetCell[][];
  format?: string | null;
}): Promise<Response> {
  const { sheetName, filename, header, rows, format } = opts;

  if (format === "csv") {
    // BOM so Excel opens UTF-8 names correctly.
    return new Response("﻿" + toCsv(header, rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "ParkGo";
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.addRow(header);
  rows.forEach((r) => ws.addRow(r));

  // Header styling: bold white on brand orange.
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF26A1B" } };
  head.height = 20;

  // Column widths sized to content (capped so one long field can't explode).
  header.forEach((h, i) => {
    const longest = Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length));
    ws.getColumn(i + 1).width = Math.min(Math.max(longest + 3, 10), 42);
  });

  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
