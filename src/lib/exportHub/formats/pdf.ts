import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CATEGORY_IDS, getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function buildPdfBlob(expenses: Expense[], title: string, groupByCategory = false): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt" });

  doc.setFontSize(16);
  doc.text(title, 40, 44);

  doc.setFontSize(10);
  doc.setTextColor(120);
  const generatedOn = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(),
  );
  doc.text(`Generated ${generatedOn} · ${expenses.length} record${expenses.length === 1 ? "" : "s"}`, 40, 62);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.text(`Total: ${formatCurrency(total)}`, 40, 78);

  if (!groupByCategory) {
    autoTable(doc, {
      startY: 96,
      head: [["Date", "Category", "Amount", "Description"]],
      body: expenses.map((e) => [formatDate(e.date), getCategoryLabel(e.category), formatCurrency(e.amount), e.description]),
      headStyles: { fillColor: [42, 120, 214] },
      styles: { fontSize: 9, cellPadding: 6 },
      columnStyles: { 2: { halign: "right" } },
      margin: { left: 40, right: 40 },
    });
  } else {
    let startY = 96;
    for (const categoryId of CATEGORY_IDS) {
      const group = expenses.filter((e) => e.category === categoryId);
      if (group.length === 0) continue;
      const subtotal = group.reduce((sum, e) => sum + e.amount, 0);

      autoTable(doc, {
        startY,
        head: [[getCategoryLabel(categoryId), "", ""]],
        body: [
          ...group.map((e) => [formatDate(e.date), formatCurrency(e.amount), e.description]),
          ["", `Subtotal: ${formatCurrency(subtotal)}`, ""],
        ],
        headStyles: { fillColor: [42, 120, 214] },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 1: { halign: "right" } },
        margin: { left: 40, right: 40 },
        didParseCell: (data) => {
          const isSubtotalRow = data.row.index === group.length;
          if (isSubtotalRow) data.cell.styles.fontStyle = "bold";
        },
      });
      // @ts-expect-error jspdf-autotable augments doc with lastAutoTable at runtime
      startY = doc.lastAutoTable.finalY + 18;
    }
  }

  return doc.output("blob");
}

export function downloadPdf(expenses: Expense[], title: string, filename: string, groupByCategory = false): void {
  const blob = buildPdfBlob(expenses, title, groupByCategory);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
