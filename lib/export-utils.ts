/**
 * Export budget data to CSV format
 */
export function exportBudgetToCSV(budget: any) {
  const lines = [
    // Header
    ["Budget Export"],
    [""],
    ["Budget Name:", budget.name],
    ["Department:", budget.department || "General"],
    ["Fiscal Year:", budget.fiscalYear],
    ["Status:", budget.status],
    ["Total Allocated:", `₹${budget.allocated?.toLocaleString() || 0}`],
    ["Total Spent:", `₹${budget.spent?.toLocaleString() || 0}`],
    [
      "Remaining:",
      `₹${((budget.allocated || 0) - (budget.spent || 0)).toLocaleString()}`,
    ],
    [""],
    ["Budget Line Items"],
    ["Description", "Planned Amount", "Product ID"],
  ];

  // Add budget lines
  if (budget.lines && budget.lines.length > 0) {
    budget.lines.forEach((line: any) => {
      lines.push([
        line.description || "",
        line.plannedAmount?.toString() || "0",
        line.productId || "",
      ]);
    });
  } else {
    lines.push(["No line items"]);
  }

  // Convert to CSV string
  const csvContent = lines
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `budget-${budget.name.replace(/\s+/g, "-")}-${Date.now()}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export all budgets to CSV format
 */
export function exportAllBudgetsToCSV(budgets: any[]) {
  const lines = [
    // Header
    ["Budgets Export"],
    [""],
    [
      "Budget Name",
      "Department",
      "Fiscal Year",
      "Status",
      "Allocated",
      "Spent",
      "Remaining",
      "Utilization %",
    ],
  ];

  // Add budget rows
  budgets.forEach((budget) => {
    const allocated = budget.allocated || 0;
    const spent = budget.spent || 0;
    const remaining = allocated - spent;
    const utilization =
      allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : "0";

    lines.push([
      budget.name,
      budget.department || "General",
      budget.fiscalYear?.toString() || "",
      budget.status || "DRAFT",
      allocated.toString(),
      spent.toString(),
      remaining.toString(),
      utilization,
    ]);
  });

  // Convert to CSV string
  const csvContent = lines
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `budgets-export-${Date.now()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
