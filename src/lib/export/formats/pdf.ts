import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCategoryLabel } from "@/lib/categories";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function buildAndDownloadPdf(expenses: Expense[], filename: string): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt" });

  doc.setFontSize(16);
  doc.text("Expense Report", 40, 44);

  doc.setFontSize(10);
  doc.setTextColor(120);
  const generatedOn = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  doc.text(`Generated ${generatedOn} · ${expenses.length} record${expenses.length === 1 ? "" : "s"}`, 40, 62);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  doc.text(`Total: ${formatCurrency(total)}`, 40, 78);

  autoTable(doc, {
    startY: 96,
    head: [["Date", "Category", "Amount", "Description"]],
    body: expenses.map((e) => [
      formatDate(e.date),
      getCategoryLabel(e.category),
      formatCurrency(e.amount),
      e.description,
    ]),
    headStyles: { fillColor: [42, 120, 214] }, // matches the app's accent blue
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 2: { halign: "right" } },
    margin: { left: 40, right: 40 },
  });

  doc.save(filename);
}
