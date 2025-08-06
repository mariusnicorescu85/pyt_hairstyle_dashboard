// PYT Hairstyle Dashboard JavaScript - Part 1: Variables and Basic Functions

let employeeData = [];
let shopMetrics = null;

// PYT-specific expected employees (from your N8N workflow)
const PYT_EMPLOYEES = [
  "Aiyla Akhtar",
  "Codruta Nicorescu",
  "Eiman",
  "Eshaal Awan",
  "Faiza Zulficar",
  "Fatima Zulficar",
  "Hasseb Alina",
  "Jouman",
  "Jude Elsidiq",
  "Karena",
  "Katelyn Harnett",
  "Katie",
  "Lee Adam",
  "Makeel Rimsha",
  "Misha",
  "Temitope",
  "Tuba Raja",
  "Zoya Julani",
];

// Function to receive data from N8N workflow
function receiveWorkflowData(data) {
  try {
    console.log("Raw PYT data received:", data);
    const parsed = parseN8NData(data);
    employeeData = parsed.employees;
    shopMetrics = parsed.shopMetrics;
    console.log("Parsed PYT employees:", employeeData);
    console.log("PYT shop metrics:", shopMetrics);
    renderEmployeeReports();
    document.getElementById("lastUpdated").textContent =
      new Date().toLocaleString();
    showStatus(
      `PYT Hairstyle data loaded successfully! Found ${employeeData.length} employees.`,
      "success"
    );
  } catch (error) {
    showStatus("Error processing PYT data: " + error.message, "error");
    console.error("Data processing error:", error);
    console.error("Raw data:", data);
  }
}

// Helper function to determine efficiency rating for hair salon
function getEfficiencyRating(salaryToSales, salesShare) {
  // Hair salon specific efficiency ranges
  if (salesShare > 12 && salaryToSales < 30) return "⭐⭐⭐ Excellent Stylist";
  if (salesShare > 8 && salaryToSales < 40) return "⭐⭐ Strong Performer";
  if (salesShare > 4 && salaryToSales < 55) return "⭐ Good Stylist";
  if (salaryToSales > 0) return "⚠️ Needs Development";
  return "📊 New/Training";
}

function getShopEfficiencyRating(efficiency) {
  // Hair salon industry standards
  if (efficiency < 20) return "🌟 Exceptional Salon";
  if (efficiency < 25) return "✅ Very Profitable";
  if (efficiency < 30) return "👍 Healthy Business";
  if (efficiency < 35) return "⚠️ Room for Improvement";
  return "🔴 Needs Optimization";
}

function showStatus(message, type = "status") {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = type;
}
// PYT Hairstyle Dashboard JavaScript - Part 2: Data Parsing Functions

// Parse data from your PYT N8N workflow format
function parseN8NData(rawData) {
  console.log("Starting to parse PYT data:", rawData);
  const employees = [];
  let shopMetrics = null;

  // Handle array of data items (from N8N)
  const dataArray = Array.isArray(rawData) ? rawData : [rawData];
  console.log("PYT data array length:", dataArray.length);

  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    console.log(`Processing PYT item ${i}:`, item);

    // Skip empty items, headers, and breakdown sections
    if (!item || typeof item !== "object") {
      console.log(`Skipping PYT item ${i}: not an object`);
      continue;
    }
    if (item.Employee === "Employee") {
      console.log(`Skipping PYT item ${i}: header row`);
      continue;
    }
    if (item.Employee && item.Employee.includes(" - Daily Breakdown")) {
      console.log(`Skipping PYT item ${i}: breakdown header`);
      continue;
    }
    if (item.Employee && item.Employee === "TOTAL_SUMMARY") {
      console.log(`Skipping PYT item ${i}: total summary row`);
      continue;
    }
    if (item.Employee && item.Employee === "SHOP_METRICS") {
      console.log(`Found PYT shop metrics: ${item.Employee}`);
      shopMetrics = {
        period: item.Period,
        totalDays: parseFloat(item.WorkedDays) || 0,
        totalHours: parseFloat(item.WorkedHours) || 0,
        totalSales:
          parseFloat(item.AdjustedSales?.replace("£", "").replace(",", "")) ||
          0,
        totalSalaries:
          parseFloat(item.FinalTotal?.replace("£", "").replace(",", "")) || 0,
        shopEfficiency:
          parseFloat(item.SalaryToSalesPct?.replace("%", "")) || 0,
        description:
          item.Description || "PYT Hairstyle shop efficiency metrics",
      };
      continue;
    }
    if (!item.Employee || item.Employee === "") {
      console.log(`Skipping PYT item ${i}: no employee name`);
      continue;
    }

    // Check if this is a main employee summary row for PYT
    if (
      item.Employee &&
      item.Period &&
      item.WorkedDays &&
      !item.Employee.includes(" - ") &&
      item.FinalTotal &&
      PYT_EMPLOYEES.includes(item.Employee)
    ) {
      console.log(`Found PYT employee: ${item.Employee}`);

      const employee = {
        name: item.Employee,
        period: item.Period,
        paymentType: item.PaymentType || "HOURLY ONLY",
        workedDays: parseFloat(item.WorkedDays) || 0,
        workedHours: parseFloat(item.WorkedHours) || 0,
        hourlyRate:
          parseFloat(item.HourlyRate?.replace("£", "").replace(",", "")) || 0,
        salesPercentage:
          item.SalesPercentage === "Tiered" || item.SalesPercentage === "N/A"
            ? item.SalesPercentage
            : parseFloat(item.SalesPercentage?.replace("%", "")) / 100 || 0,
        basePayment:
          parseFloat(item.BasePayment?.replace("£", "").replace(",", "")) || 0,
        totalSales:
          parseFloat(item.TotalSales?.replace("£", "").replace(",", "")) || 0,
        addlSales:
          parseFloat(item.AddlSales?.replace("£", "").replace(",", "")) || 0,
        adjustedSales:
          parseFloat(item.AdjustedSales?.replace("£", "").replace(",", "")) ||
          0,
        salesCommission:
          parseFloat(item.SalesCommission?.replace("£", "").replace(",", "")) ||
          0,
        bonusPayment:
          parseFloat(item.BonusPayment?.replace("£", "").replace(",", "")) || 0,
        finalTotal:
          parseFloat(item.FinalTotal?.replace("£", "").replace(",", "")) || 0,
        avgSalesPerDay:
          parseFloat(item.AvgSalesPerDay?.replace("£", "").replace(",", "")) ||
          0,
        avgSalesPerHour:
          parseFloat(item.AvgSalesPerHour?.replace("£", "").replace(",", "")) ||
          0,
        description: item.Description || "PYT standard hourly configuration",
        configVersion: item.ConfigVersion || "2025-v1",
        dataIssues: item.DataIssues || "None",
        salaryToSalesPct:
          parseFloat(item.SalaryToSalesPct?.replace("%", "")) || 0,
        salesShareOfShop:
          parseFloat(item.SalesShareOfShop?.replace("%", "")) || 0,
        salaryShareOfShop:
          parseFloat(item.SalaryShareOfShop?.replace("%", "")) || 0,
      };

      console.log("Created PYT employee object:", employee);
      employees.push(employee);
    }
  }

  // If no SHOP_METRICS found, calculate from employee data
  if (!shopMetrics && employees.length > 0) {
    const totalSales = employees.reduce(
      (sum, emp) => sum + emp.adjustedSales,
      0
    );
    const totalSalaries = employees.reduce(
      (sum, emp) => sum + emp.finalTotal,
      0
    );
    const totalDays = employees.reduce((sum, emp) => sum + emp.workedDays, 0);
    const totalHours = employees.reduce((sum, emp) => sum + emp.workedHours, 0);

    shopMetrics = {
      period: employees[0]?.period || "2025-07",
      totalDays: totalDays,
      totalHours: totalHours,
      totalSales: totalSales,
      totalSalaries: totalSalaries,
      shopEfficiency: totalSales > 0 ? (totalSalaries / totalSales) * 100 : 0,
      description: `PYT Hairstyle calculated from ${employees.length} stylists`,
    };
    console.log(
      `✅ Calculated PYT shop metrics from employee data:`,
      shopMetrics
    );
  }

  console.log("Final PYT employees array:", employees);
  console.log("Final PYT shop metrics:", shopMetrics);
  return { employees, shopMetrics };
}
// PYT Hairstyle Dashboard JavaScript - Part 3: Shop Summary and Individual Employee Rendering

function addShopSummarySection(container) {
  const summarySection = document.createElement("div");
  summarySection.className = "employee-section shop-summary";
  summarySection.innerHTML = `
    <div class="employee-header">
        💇‍♀️ PYT Hairstyle Collab Performance Summary - ${shopMetrics.period}
    </div>
    <div class="summary-section">
        <table class="summary-table">
            <tr>
                <th>Salon Metric</th>
                <th>Total Value</th>
                <th>Business Analysis</th>
            </tr>
            <tr>
                <td><strong>Total Sales</strong></td>
                <td class="currency"><strong>£${shopMetrics.totalSales.toFixed(
                  2
                )}</strong></td>
                <td>All services & products across ${
                  employeeData.length
                } stylists</td>
            </tr>
            <tr>
                <td><strong>Total Payroll</strong></td>
                <td class="currency"><strong>£${shopMetrics.totalSalaries.toFixed(
                  2
                )}</strong></td>
                <td>All stylist payments combined</td>
            </tr>
            <tr class="totals-row">
                <td><strong>Salon Efficiency Ratio</strong></td>
                <td><strong>${shopMetrics.shopEfficiency.toFixed(
                  2
                )}%</strong></td>
                <td><strong>Labor cost per £1 of sales - ${getShopEfficiencyRating(
                  shopMetrics.shopEfficiency
                )}</strong></td>
            </tr>
            <tr>
                <td>Total Service Hours</td>
                <td>${shopMetrics.totalHours.toFixed(2)}</td>
                <td>Combined hours worked by all stylists</td>
            </tr>
            <tr>
                <td>Total Working Days</td>
                <td>${shopMetrics.totalDays}</td>
                <td>Combined working days across all stylists</td>
            </tr>
            <tr>
                <td>Average Sales per Hour</td>
                <td class="currency">£${(
                  shopMetrics.totalSales / shopMetrics.totalHours
                ).toFixed(2)}</td>
                <td>Salon productivity: revenue per service hour</td>
            </tr>
            <tr>
                <td>Gross Profit Margin (Est.)</td>
                <td>${(100 - shopMetrics.shopEfficiency).toFixed(2)}%</td>
                <td>Estimated margin after stylist labor costs</td>
            </tr>
            <tr>
                <td>Average Stylist Sales</td>
                <td class="currency">£${(
                  shopMetrics.totalSales / employeeData.length
                ).toFixed(2)}</td>
                <td>Mean sales performance per stylist</td>
            </tr>
        </table>
    </div>
  `;
  container.appendChild(summarySection);
}

function addIndividualSummarySection(container) {
  const totalPayment = employeeData.reduce(
    (sum, emp) => sum + emp.finalTotal,
    0
  );
  const totalSales = employeeData.reduce(
    (sum, emp) => sum + emp.adjustedSales,
    0
  );
  const totalCommission = employeeData.reduce(
    (sum, emp) => sum + emp.salesCommission,
    0
  );
  const totalHours = employeeData.reduce(
    (sum, emp) => sum + emp.workedHours,
    0
  );

  const summarySection = document.createElement("div");
  summarySection.className = "employee-section";
  summarySection.innerHTML = `
    <div class="employee-header">
        📊 PYT Hairstyle Stylist Summary - ${employeeData.length} Team Members
    </div>
    <div class="summary-section">
        <table class="summary-table">
            <tr>
                <th>Metric</th>
                <th>Total</th>
                <th>Average per Stylist</th>
            </tr>
            <tr>
                <td>Total Service Hours</td>
                <td>${totalHours.toFixed(2)}</td>
                <td>${(totalHours / employeeData.length).toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Sales</td>
                <td class="currency">£${totalSales.toFixed(2)}</td>
                <td class="currency">£${(
                  totalSales / employeeData.length
                ).toFixed(2)}</td>
            </tr>
            <tr>
                <td>Total Commission</td>
                <td class="currency">£${totalCommission.toFixed(2)}</td>
                <td class="currency">£${(
                  totalCommission / employeeData.length
                ).toFixed(2)}</td>
            </tr>
            <tr class="totals-row">
                <td><strong>Total Payments</strong></td>
                <td class="currency"><strong>£${totalPayment.toFixed(
                  2
                )}</strong></td>
                <td class="currency"><strong>£${(
                  totalPayment / employeeData.length
                ).toFixed(2)}</strong></td>
            </tr>
        </table>
    </div>
  `;
  container.appendChild(summarySection);
}
// PYT Hairstyle Dashboard JavaScript - Part 4: Main Rendering Function (Part 1)

// Render employee reports with PYT styling
function renderEmployeeReports() {
  const container = document.getElementById("employeeReports");
  container.innerHTML = "";

  if (employeeData.length === 0) {
    container.innerHTML =
      '<div class="status">No PYT Hairstyle employee data available</div>';
    return;
  }

  // Add shop metrics summary first
  if (shopMetrics) {
    addShopSummarySection(container);
  }

  employeeData.forEach((emp, index) => {
    const section = document.createElement("div");
    section.className = "employee-section";

    // PYT-specific payment type display
    let paymentTypeDisplay = emp.paymentType;
    if (emp.paymentType === "HOURLY_ONLY") {
      paymentTypeDisplay = "💇‍♀️ Hourly Rate Only";
    }

    // PYT Hairstyle Dashboard JavaScript - Part 5: Complete Employee Table HTML

    // This is the complete HTML for the employee table section that goes inside renderEmployeeReports()
    // Replace the section.innerHTML in Part 4 with this complete version:

    const completeEmployeeHTML = `
      <div class="employee-header">
        💇‍♀️ ${emp.name} - ${emp.period}
        <span style="float: right; font-size: 14px;">
            ${paymentTypeDisplay} | Total: £${emp.finalTotal.toFixed(2)} | 
            <span style="color: ${
              (emp.finalTotal / emp.adjustedSales) * 100 < 35
                ? "#4CAF50"
                : (emp.finalTotal / emp.adjustedSales) * 100 < 50
                ? "#FF9800"
                : "#F44336"
            };">
                ${
                  emp.adjustedSales > 0
                    ? ((emp.finalTotal / emp.adjustedSales) * 100).toFixed(1)
                    : "0.0"
                }%
            </span>
        </span>
      </div>
      <div class="summary-section">
          <table class="summary-table">
              <tr>
                  <th style="width: 25%;">Metric</th>
                  <th style="width: 20%;">Value</th>
                  <th style="width: 55%;">Details</th>
              </tr>
              <tr>
                  <td><strong>💼 Employment Structure</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr>
                  <td>Payment Type</td>
                  <td>${paymentTypeDisplay}</td>
                  <td>${emp.description}</td>
              </tr>
              <tr>
                  <td>Config Version</td>
                  <td>${emp.configVersion}</td>
                  <td>PYT Hairstyle configuration tracking</td>
              </tr>
              <tr>
                  <td>Data Quality</td>
                  <td>${emp.dataIssues}</td>
                  <td>Data validation results</td>
              </tr>
              <tr>
                  <td><strong>⏰ Work Summary</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr>
                  <td>Worked Days</td>
                  <td>${emp.workedDays}</td>
                  <td>Total working days in period</td>
              </tr>
              <tr>
                  <td>Service Hours</td>
                  <td>${emp.workedHours.toFixed(2)}</td>
                  <td>Total hours on the salon floor</td>
              </tr>
              <tr>
                  <td>Hourly Rate</td>
                  <td class="currency">£${emp.hourlyRate.toFixed(2)}</td>
                  <td>Base hourly payment rate</td>
              </tr>
              <tr>
                  <td><strong>💰 Sales & Services</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr>
                  <td>Commission Rate</td>
                  <td>${
                    typeof emp.salesPercentage === "string"
                      ? emp.salesPercentage
                      : emp.salesPercentage > 0
                      ? (emp.salesPercentage * 100).toFixed(1) + "%"
                      : "N/A"
                  }</td>
                  <td>Commission on services (if applicable)</td>
              </tr>
              <tr>
                  <td>Service Sales</td>
                  <td class="currency">£${emp.totalSales.toFixed(2)}</td>
                  <td>Hair services & treatments</td>
              </tr>
              <tr>
                  <td>Additional Sales</td>
                  <td class="currency">£${emp.addlSales.toFixed(2)}</td>
                  <td>Products & extras</td>
              </tr>
              <tr>
                  <td>Total Sales</td>
                  <td class="currency">£${emp.adjustedSales.toFixed(2)}</td>
                  <td>Combined services + products</td>
              </tr>
              <tr>
                  <td><strong>💸 Payment Calculation</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr>
                  <td>Base Payment</td>
                  <td class="currency">£${emp.basePayment.toFixed(2)}</td>
                  <td>${emp.workedHours.toFixed(
                    2
                  )} hours × £${emp.hourlyRate.toFixed(2)}/hour</td>
              </tr>
              <tr>
                  <td>Sales Commission</td>
                  <td class="currency">£${emp.salesCommission.toFixed(2)}</td>
                  <td>${
                    emp.salesCommission > 0
                      ? `£${emp.adjustedSales.toFixed(2)} × ${
                          typeof emp.salesPercentage === "string"
                            ? emp.salesPercentage
                            : (emp.salesPercentage * 100).toFixed(1) + "%"
                        }`
                      : "No commission (hourly only)"
                  }</td>
              </tr>
              <tr>
                  <td>Bonus Payment</td>
                  <td class="currency">£${emp.bonusPayment.toFixed(2)}</td>
                  <td>Performance bonuses & adjustments</td>
              </tr>
              <tr class="totals-row">
                  <td><strong>Final Total Payment</strong></td>
                  <td class="currency"><strong>£${emp.finalTotal.toFixed(
                    2
                  )}</strong></td>
                  <td><strong>Base + Commission + Bonuses</strong></td>
              </tr>
              <tr>
                  <td><strong>📊 Performance Metrics</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr>
                  <td>Average Sales per Day</td>
                  <td class="currency">£${emp.avgSalesPerDay.toFixed(2)}</td>
                  <td>£${emp.adjustedSales.toFixed(2)} ÷ ${
      emp.workedDays
    } days</td>
              </tr>
              <tr>
                  <td>Average Sales per Hour</td>
                  <td class="currency">£${emp.avgSalesPerHour.toFixed(2)}</td>
                  <td>£${emp.adjustedSales.toFixed(
                    2
                  )} ÷ ${emp.workedHours.toFixed(2)} hours</td>
              </tr>
              <tr>
                  <td>Earnings per Day</td>
                  <td class="currency">£${(
                    emp.finalTotal / emp.workedDays
                  ).toFixed(2)}</td>
                  <td>Total payment ÷ working days</td>
              </tr>
              <tr>
                  <td><strong>🏪 Salon Efficiency Metrics</strong></td>
                  <td colspan="2"></td>
              </tr>
              <tr class="efficiency-row">
                  <td>Cost Efficiency</td>
                  <td>${
                    emp.adjustedSales > 0
                      ? ((emp.finalTotal / emp.adjustedSales) * 100).toFixed(2)
                      : "0.00"
                  }%</td>
                  <td>Labor cost per £1 of sales (lower = better)</td>
              </tr>
              <tr class="efficiency-row">
                  <td>Sales Share of Salon</td>
                  <td>${
                    shopMetrics
                      ? (
                          (emp.adjustedSales / shopMetrics.totalSales) *
                          100
                        ).toFixed(2)
                      : "0.00"
                  }%</td>
                  <td>Contribution to total salon revenue</td>
              </tr>
              <tr class="efficiency-row">
                  <td>Payroll Share of Salon</td>
                  <td>${
                    shopMetrics
                      ? (
                          (emp.finalTotal / shopMetrics.totalSalaries) *
                          100
                        ).toFixed(2)
                      : "0.00"
                  }%</td>
                  <td>Proportion of total salon payroll</td>
              </tr>
              <tr class="efficiency-row">
                  <td>Stylist Rating</td>
                  <td>${getEfficiencyRating(
                    emp.adjustedSales > 0
                      ? (emp.finalTotal / emp.adjustedSales) * 100
                      : 0,
                    shopMetrics
                      ? (emp.adjustedSales / shopMetrics.totalSales) * 100
                      : 0
                  )}</td>
                  <td>Overall performance assessment</td>
              </tr>
          </table>
      </div>
    `;

    // Continue with more table rows in the next part...

    container.appendChild(section);
  });

  // Add individual summary section
  if (employeeData.length > 1) {
    addIndividualSummarySection(container);
  }
}
// PYT Hairstyle Dashboard JavaScript - Part 6: Google Sheets and CSV Functions

// PYT-specific functions with correct URL formats
async function fetchPYTFromGoogleSheets() {
  const sheetTab = document.getElementById("sheetTab").value || "july";
  const sheetId = "1VlQ9JRTSCdtIyxbh-AffUawdAIEgZw33W_poq1X6R5s"; // PYT Sheet ID

  showStatus(`Fetching PYT Hairstyle data from ${sheetTab} tab...`, "status");

  // Map sheet names to GIDs (you may need to update these based on your actual sheet structure)
  const sheetGIDs = {
    july: "0", // Default first sheet
    june: "1234567890", // You'll need to find the actual GID
    august: "1234567891", // You'll need to find the actual GID
    may: "1234567892", // You'll need to find the actual GID
  };

  const gid = sheetGIDs[sheetTab.toLowerCase()] || "0";

  // Try multiple URL formats
  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
  ];

  for (let i = 0; i < urlsToTry.length; i++) {
    const csvUrl = urlsToTry[i];
    console.log(`Trying PYT URL ${i + 1}:`, csvUrl);

    try {
      const response = await fetch(csvUrl, {
        method: "GET",
        mode: "cors",
      });

      console.log(`PYT Response ${i + 1} status:`, response.status);

      if (response.ok) {
        const csvText = await response.text();
        console.log(
          `PYT Success with URL ${i + 1}! First 500 chars:`,
          csvText.substring(0, 500)
        );

        debugCSVStructure(csvText);

        // Check if this looks like our PYT data
        if (
          csvText.length > 50 &&
          (csvText.includes("employee") ||
            csvText.includes("Employee") ||
            csvText.includes(","))
        ) {
          const parsedData = parsePYTCSVToEmployeeData(csvText);
          console.log("Parsed PYT employee data:", parsedData);

          if (parsedData.employees.length > 0) {
            const mockData = parsedData.employees.map((emp) => ({
              Employee: emp.name,
              Period: emp.period,
              PaymentType: emp.paymentType,
              WorkedDays: emp.workedDays.toString(),
              WorkedHours: emp.workedHours.toFixed(2),
              HourlyRate: `£${emp.hourlyRate.toFixed(2)}`,
              SalesPercentage: emp.salesPercentage,
              BasePayment: `£${emp.basePayment.toFixed(2)}`,
              TotalSales: `£${emp.totalSales.toFixed(2)}`,
              AddlSales: `£${emp.addlSales.toFixed(2)}`,
              AdjustedSales: `£${emp.adjustedSales.toFixed(2)}`,
              SalesCommission: `£${emp.salesCommission.toFixed(2)}`,
              BonusPayment: `£${emp.bonusPayment.toFixed(2)}`,
              FinalTotal: `£${emp.finalTotal.toFixed(2)}`,
              AvgSalesPerDay: `£${emp.avgSalesPerDay.toFixed(2)}`,
              AvgSalesPerHour: `£${emp.avgSalesPerHour.toFixed(2)}`,
              Description: emp.description,
              ConfigVersion: emp.configVersion,
              DataIssues: emp.dataIssues,
              SalaryToSalesPct: `${emp.salaryToSalesPct.toFixed(2)}%`,
              SalesShareOfShop: `${emp.salesShareOfShop.toFixed(2)}%`,
              SalaryShareOfShop: `${emp.salaryShareOfShop.toFixed(2)}%`,
            }));

            // Add SHOP_METRICS if found
            if (parsedData.shopMetrics) {
              mockData.push({
                Employee: "SHOP_METRICS",
                Period: parsedData.shopMetrics.period,
                PaymentType: "ALL_TYPES",
                WorkedDays: parsedData.shopMetrics.totalDays.toString(),
                WorkedHours: parsedData.shopMetrics.totalHours.toFixed(2),
                AdjustedSales: `£${parsedData.shopMetrics.totalSales.toFixed(
                  2
                )}`,
                FinalTotal: `£${parsedData.shopMetrics.totalSalaries.toFixed(
                  2
                )}`,
                Description: parsedData.shopMetrics.description,
                SalaryToSalesPct: `${parsedData.shopMetrics.shopEfficiency.toFixed(
                  2
                )}%`,
                SalesShareOfShop: "100.00%",
                SalaryShareOfShop: "100.00%",
              });
            }

            receiveWorkflowData(mockData);
            return;
          } else {
            console.log("No valid PYT employee data found, trying next URL...");
          }
        } else {
          console.log(
            "Response doesn't look like PYT CSV data, trying next URL..."
          );
        }
      }
    } catch (error) {
      console.log(`PYT URL ${i + 1} failed:`, error.message);
    }
  }

  // If all URLs failed
  showStatus(
    `Unable to fetch PYT Hairstyle data for "${sheetTab}" tab. Please check: 1) Sheet is shared publicly, 2) Tab "${sheetTab}" exists, 3) Tab contains data`,
    "error"
  );
}

// Parse CSV data to PYT employee format
// FIXED CSV Parser for PYT Data - Replace the existing parsePYTCSVToEmployeeData function

function parsePYTCSVToEmployeeData(csvText) {
  const lines = csvText.split("\n");
  const employees = [];
  let shopMetrics = null;

  console.log("🔍 PYT CSV lines:", lines.length);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());

    // Skip header rows and empty rows
    if (
      i <= 0 ||
      columns[0] === "employee" ||
      columns[0] === "" ||
      columns[0] === "Employee"
    ) {
      continue;
    }

    // Handle SHOP_METRICS row - FIXED COLUMN MAPPING
    if (columns[0] === "SHOP_METRICS") {
      console.log(
        `📊 Found SHOP_METRICS with ${columns.length} columns:`,
        columns
      );

      // Based on your data structure, map columns correctly:
      shopMetrics = {
        period: columns[1] || "2025-07",
        totalDays: parseFloat(columns[3]) || 0,
        totalHours: parseFloat(columns[4]) || 0,
        // FIX: AdjustedSales is likely in a different column - let's try multiple positions
        totalSales:
          parseFloat(columns[10]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[11]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[9]?.replace(/[£,"]/g, "")) ||
          0,
        // FIX: FinalTotal is likely in a different column
        totalSalaries:
          parseFloat(columns[13]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[14]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[12]?.replace(/[£,"]/g, "")) ||
          0,
        shopEfficiency: 0, // We'll calculate this manually
        description:
          columns[16] || columns[6] || "PYT Hairstyle shop metrics from CSV",
      };

      // Manual calculation if the values seem wrong
      if (shopMetrics.totalSales < 100 || shopMetrics.totalSalaries < 100) {
        console.log(
          "⚠️ Shop metrics seem incorrect, will calculate from employee data"
        );
        shopMetrics = null; // This will trigger calculation from employee data
      } else {
        shopMetrics.shopEfficiency =
          shopMetrics.totalSales > 0
            ? (shopMetrics.totalSalaries / shopMetrics.totalSales) * 100
            : 0;
      }

      console.log(`✅ PYT SHOP_METRICS parsed:`, shopMetrics);
      continue;
    }

    // Handle Employee rows - FIXED PARSING
    if (
      columns[0] &&
      !columns[0].includes("Daily Breakdown") &&
      !columns[0].includes(" - ") &&
      !columns[0].includes("TOTAL_SUMMARY") &&
      !columns[0].includes("BONUS_SUMMARY") &&
      PYT_EMPLOYEES.includes(columns[0])
    ) {
      console.log(
        `Found PYT employee: ${columns[0]} - ${columns.length} columns`
      );

      if (columns.length >= 15) {
        // FIX: Better parsing with fallback values
        const finalTotal =
          parseFloat(columns[13]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[14]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[12]?.replace(/[£,"]/g, "")) ||
          0;

        const basePayment =
          parseFloat(columns[7]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[8]?.replace(/[£,"]/g, "")) ||
          finalTotal; // Use finalTotal as fallback

        const adjustedSales =
          parseFloat(columns[10]?.replace(/[£,"]/g, "")) ||
          parseFloat(columns[11]?.replace(/[£,"]/g, "")) ||
          0;

        const employee = {
          name: columns[0],
          period: columns[1] || "2025-07",
          paymentType: columns[2] || "HOURLY ONLY",
          workedDays: parseFloat(columns[3]) || 0,
          workedHours: parseFloat(columns[4]) || 0,
          hourlyRate: parseFloat(columns[5]?.replace(/[£,"]/g, "")) || 0,
          salesPercentage: columns[6] || "N/A",
          basePayment: basePayment,
          totalSales: parseFloat(columns[8]?.replace(/[£,"]/g, "")) || 0,
          addlSales: parseFloat(columns[9]?.replace(/[£,"]/g, "")) || 0,
          adjustedSales: adjustedSales,
          salesCommission: parseFloat(columns[11]?.replace(/[£,"]/g, "")) || 0,
          bonusPayment: parseFloat(columns[12]?.replace(/[£,"]/g, "")) || 0,
          finalTotal: finalTotal,
          avgSalesPerDay:
            parseFloat(columns[14]?.replace(/[£,"]/g, "")) ||
            (adjustedSales && parseFloat(columns[3]) > 0
              ? adjustedSales / parseFloat(columns[3])
              : 0),
          avgSalesPerHour:
            parseFloat(columns[15]?.replace(/[£,"]/g, "")) ||
            (adjustedSales && parseFloat(columns[4]) > 0
              ? adjustedSales / parseFloat(columns[4])
              : 0),
          description: columns[16] || "PYT standard configuration",
          configVersion: columns[17] || "2025-v1",
          dataIssues: columns[18] || "None",
          salaryToSalesPct:
            adjustedSales > 0 ? (finalTotal / adjustedSales) * 100 : 0,
          salesShareOfShop: 0, // Will be calculated later
          salaryShareOfShop: 0, // Will be calculated later
        };

        employees.push(employee);
        console.log(
          `✅ ADDED PYT: ${employee.name} - £${employee.finalTotal} (Base: £${employee.basePayment})`
        );
      }
    }
  }

  // Calculate shop metrics from employee data if not found or incorrect
  if (!shopMetrics && employees.length > 0) {
    const totalSales = employees.reduce(
      (sum, emp) => sum + emp.adjustedSales,
      0
    );
    const totalSalaries = employees.reduce(
      (sum, emp) => sum + emp.finalTotal,
      0
    );
    const totalDays = employees.reduce((sum, emp) => sum + emp.workedDays, 0);
    const totalHours = employees.reduce((sum, emp) => sum + emp.workedHours, 0);

    shopMetrics = {
      period: employees[0]?.period || "2025-07",
      totalDays: totalDays,
      totalHours: totalHours,
      totalSales: totalSales,
      totalSalaries: totalSalaries,
      shopEfficiency: totalSales > 0 ? (totalSalaries / totalSales) * 100 : 0,
      description: `Calculated from ${employees.length} PYT stylists`,
    };

    console.log(`🧮 Calculated PYT shop metrics:`, shopMetrics);
  }

  // Update employee percentages with correct shop totals
  if (shopMetrics && employees.length > 0) {
    employees.forEach((emp) => {
      emp.salesShareOfShop =
        shopMetrics.totalSales > 0
          ? (emp.adjustedSales / shopMetrics.totalSales) * 100
          : 0;
      emp.salaryShareOfShop =
        shopMetrics.totalSalaries > 0
          ? (emp.finalTotal / shopMetrics.totalSalaries) * 100
          : 0;
    });
  }

  console.log(`📊 PYT SUMMARY: Added ${employees.length} employees`);
  return { employees, shopMetrics };
}
// PYT Hairstyle Dashboard JavaScript - Part 7: Comparison and Test Data Functions

async function fetchAndComparePYTSheets() {
  const sheet1 = document.getElementById("sheetTab").value || "july";
  const sheet2 = document.getElementById("compareSheet").value;

  if (!sheet2) {
    alert("Please enter a second sheet name to compare with");
    return;
  }

  if (sheet1 === sheet2) {
    alert("Please enter different sheet names to compare");
    return;
  }

  showStatus(
    `Loading PYT Hairstyle ${sheet1} and ${sheet2} for comparison...`,
    "status"
  );

  try {
    // Load first sheet
    document.getElementById("sheetTab").value = sheet1;
    await fetchPYTFromGoogleSheets();
    const data1 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
    };

    // Load second sheet
    document.getElementById("sheetTab").value = sheet2;
    await fetchPYTFromGoogleSheets();
    const data2 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
    };

    // Render comparison
    renderPYTSheetComparison(data1, data2, sheet1, sheet2);

    // Restore original sheet name
    document.getElementById("sheetTab").value = sheet1;
  } catch (error) {
    showStatus("Error comparing PYT sheets: " + error.message, "error");
  }
}

function loadPYTTestData() {
  // Test data based on your PYT N8N workflow structure
  const testData = [
    {
      Employee: "Employee",
      Period: "Period",
      PaymentType: "Payment Type",
      WorkedDays: "Worked Days",
      WorkedHours: "Worked Hours",
      HourlyRate: "Hourly Rate",
      SalesPercentage: "Sales %",
      BasePayment: "Base Payment",
      TotalSales: "Total Sales",
      AddlSales: "Addl Sales",
      AdjustedSales: "Adjusted Sales",
      SalesCommission: "Sales Commission",
      BonusPayment: "Bonus Payment",
      FinalTotal: "Final Total Payment",
      AvgSalesPerDay: "Avg Sales/Day",
      AvgSalesPerHour: "Avg Sales/Hour",
      Description: "Pay Structure Description",
      ConfigVersion: "Config Version",
      DataIssues: "Data Issues",
      SalaryToSalesPct: "Salary vs Own Sales %",
      SalesShareOfShop: "Sales Share of Shop %",
      SalaryShareOfShop: "Salary Share of Shop %",
    },
    {
      Employee: "Hasseb Alina",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "22",
      WorkedHours: "176.00",
      HourlyRate: "£12.50",
      SalesPercentage: "N/A",
      BasePayment: "£2200.00",
      TotalSales: "£3450.00",
      AddlSales: "£125.00",
      AdjustedSales: "£3575.00",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£2200.00",
      AvgSalesPerDay: "£162.50",
      AvgSalesPerHour: "£20.31",
      Description: "Senior stylist: £12.50/hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "61.54%",
      SalesShareOfShop: "18.75%",
      SalaryShareOfShop: "22.45%",
    },
    {
      Employee: "Makeel Rimsha",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "20",
      WorkedHours: "160.00",
      HourlyRate: "£12.21",
      SalesPercentage: "N/A",
      BasePayment: "£1953.60",
      TotalSales: "£2850.00",
      AddlSales: "£75.00",
      AdjustedSales: "£2925.00",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£1953.60",
      AvgSalesPerDay: "£146.25",
      AvgSalesPerHour: "£18.28",
      Description: "Senior stylist: £12.21/hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "66.82%",
      SalesShareOfShop: "15.33%",
      SalaryShareOfShop: "19.92%",
    },
    {
      Employee: "Fatima Zulficar",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "18",
      WorkedHours: "144.00",
      HourlyRate: "£10.00",
      SalesPercentage: "N/A",
      BasePayment: "£1440.00",
      TotalSales: "£2200.00",
      AddlSales: "£50.00",
      AdjustedSales: "£2250.00",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£1440.00",
      AvgSalesPerDay: "£125.00",
      AvgSalesPerHour: "£15.63",
      Description: "Stylist: £10/hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "64.00%",
      SalesShareOfShop: "11.79%",
      SalaryShareOfShop: "14.69%",
    },
    {
      Employee: "Eshaal Awan",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "15",
      WorkedHours: "120.00",
      HourlyRate: "£7.55",
      SalesPercentage: "N/A",
      BasePayment: "£906.00",
      TotalSales: "£1650.00",
      AddlSales: "£25.00",
      AdjustedSales: "£1675.00",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£906.00",
      AvgSalesPerDay: "£111.67",
      AvgSalesPerHour: "£13.96",
      Description: "Junior stylist: £7.55/hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "54.09%",
      SalesShareOfShop: "8.78%",
      SalaryShareOfShop: "9.24%",
    },
    {
      Employee: "Temitope",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "25",
      WorkedHours: "200.00",
      HourlyRate: "£12.21",
      SalesPercentage: "N/A",
      BasePayment: "£2442.00",
      TotalSales: "£4125.00",
      AddlSales: "£200.00",
      AdjustedSales: "£4325.00",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£2442.00",
      AvgSalesPerDay: "£173.00",
      AvgSalesPerHour: "£21.63",
      Description: "Senior stylist: £12.21/hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "56.46%",
      SalesShareOfShop: "22.67%",
      SalaryShareOfShop: "24.91%",
    },
    {
      Employee: "SHOP_METRICS",
      Period: "2025-07",
      PaymentType: "ALL_TYPES",
      WorkedDays: "100",
      WorkedHours: "800.00",
      HourlyRate: "",
      SalesPercentage: "",
      BasePayment: "",
      TotalSales: "",
      AddlSales: "",
      AdjustedSales: "£19075.00",
      SalesCommission: "",
      BonusPayment: "",
      FinalTotal: "£9801.60",
      AvgSalesPerDay: "",
      AvgSalesPerHour: "",
      Description:
        "PYT Hairstyle salon efficiency: 51.39% salary cost of total sales",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "51.39%",
      SalesShareOfShop: "100.00%",
      SalaryShareOfShop: "100.00%",
    },
  ];

  receiveWorkflowData(testData);
}
// PYT Hairstyle Dashboard JavaScript - Part 8: Final Functions and Event Listeners

function clearData() {
  employeeData = [];
  shopMetrics = null;
  document.getElementById("employeeReports").innerHTML = "";
  document.getElementById("status").className = "status";
  document.getElementById("status").textContent =
    "PYT Hairstyle data cleared. Ready to load new data...";
  document.getElementById("lastUpdated").textContent = "Not yet loaded";
}

function exportToExcel() {
  if (employeeData.length === 0) {
    alert("No PYT Hairstyle data to export");
    return;
  }

  const wb = XLSX.utils.book_new();

  // Create summary sheet with business metrics
  const summaryData = [
    ["PYT Hairstyle Employee Payment Report - Generated from N8N Workflow"],
    ["Generated:", new Date().toLocaleString()],
    ["Salon:", "PYT Hairstyle Collab"],
    [""],
    [
      "Employee",
      "Period",
      "Payment Type",
      "Worked Days",
      "Worked Hours",
      "Hourly Rate",
      "Sales %",
      "Base Payment",
      "Total Sales",
      "Addl Sales",
      "Adjusted Sales",
      "Sales Commission",
      "Bonus Payment",
      "Final Total",
      "Avg Sales/Day",
      "Avg Sales/Hour",
      "Cost Efficiency %",
      "Sales Share %",
      "Salary Share %",
      "Stylist Rating",
    ],
  ];

  employeeData.forEach((emp) => {
    summaryData.push([
      emp.name,
      emp.period,
      emp.paymentType,
      emp.workedDays,
      emp.workedHours.toFixed(2),
      emp.hourlyRate.toFixed(2),
      typeof emp.salesPercentage === "string"
        ? emp.salesPercentage
        : emp.salesPercentage > 0
        ? (emp.salesPercentage * 100).toFixed(1) + "%"
        : "N/A",
      emp.basePayment.toFixed(2),
      emp.totalSales.toFixed(2),
      emp.addlSales.toFixed(2),
      emp.adjustedSales.toFixed(2),
      emp.salesCommission.toFixed(2),
      emp.bonusPayment.toFixed(2),
      emp.finalTotal.toFixed(2),
      emp.avgSalesPerDay.toFixed(2),
      emp.avgSalesPerHour.toFixed(2),
      emp.adjustedSales > 0
        ? ((emp.finalTotal / emp.adjustedSales) * 100).toFixed(2) + "%"
        : "0.00%",
      emp.salesShareOfShop.toFixed(2) + "%",
      emp.salaryShareOfShop.toFixed(2) + "%",
      getEfficiencyRating(
        emp.adjustedSales > 0 ? (emp.finalTotal / emp.adjustedSales) * 100 : 0,
        emp.salesShareOfShop
      ),
    ]);
  });

  // Add shop metrics summary
  if (shopMetrics) {
    summaryData.push([]);
    summaryData.push(["PYT HAIRSTYLE SALON SUMMARY"]);
    summaryData.push([
      "Total Sales",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      shopMetrics.totalSales.toFixed(2),
    ]);
    summaryData.push([
      "Total Payroll",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      shopMetrics.totalSalaries.toFixed(2),
    ]);
    summaryData.push([
      "Salon Efficiency",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      shopMetrics.shopEfficiency.toFixed(2) + "%",
    ]);
    summaryData.push([
      "Efficiency Rating",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      getShopEfficiencyRating(shopMetrics.shopEfficiency),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "PYT Hair Payment Summary");

  const filename = `PYT_Hairstyle_Payments_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Multi-month comparison functions
function initializeMonthlyTabs() {
  const tabs = document.querySelectorAll(".month-tab");
  const comparisonControls = document.getElementById("comparisonControls");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      if (this.dataset.mode === "comparison") {
        comparisonControls.style.display = "block";
      } else {
        comparisonControls.style.display = "none";
        if (employeeData.length > 0) {
          renderEmployeeReports();
        }
      }
    });
  });
}

function loadMonthlyComparison() {
  alert(
    "Multi-month comparison feature coming soon! For now, use the 'Compare Two Months' button above."
  );
}

function loadHistoricalData() {
  alert(
    "Historical data loading feature coming soon! For now, load individual months using the sheet tab field."
  );
}

function exportComparisonToExcel() {
  alert(
    "Multi-month Excel export coming soon! For now, use the regular 'Export to Excel' button."
  );
}

// Fetch latest data from N8N workflow
async function fetchLatestN8NData() {
  showStatus(
    "Fetching latest PYT Hairstyle data from N8N workflow...",
    "status"
  );

  try {
    const response = await fetch("/api/receive-pyt-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.success && result.data) {
      console.log("📥 Fetched N8N data:", result);
      receiveWorkflowData(result.data);
      showStatus(
        `✅ Successfully loaded data from N8N workflow (updated: ${new Date(
          result.timestamp
        ).toLocaleString()})`,
        "success"
      );
      return true;
    } else if (response.status === 404) {
      showStatus(
        '⏳ No data from N8N workflow yet. Run your N8N workflow, then click "Refresh from N8N".',
        "status"
      );
    } else {
      throw new Error(
        `Server responded with ${response.status}: ${
          result.message || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("❌ Failed to fetch N8N data:", error);
    showStatus(`❌ Could not fetch N8N data: ${error.message}`, "error");
  }

  return false;
}

// Manual refresh function
function refreshFromN8N() {
  fetchLatestN8NData();
}

// Check for URL parameters (for simple integration)
window.addEventListener("load", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get("data");

  if (dataParam) {
    try {
      const data = JSON.parse(decodeURIComponent(dataParam));
      receiveWorkflowData(data);
      return;
    } catch (error) {
      showStatus("Error parsing URL data: " + error.message, "error");
    }
  }

  // Try to fetch from N8N API
  await fetchLatestN8NData();
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeMonthlyTabs();
});

// For webhook integration (if hosting with backend)
if (typeof window.receivePYTWebhookData === "undefined") {
  window.receivePYTWebhookData = receiveWorkflowData;
}

// Global function for N8N integration
window.receiveWorkflowData = receiveWorkflowData;
// PYT Hairstyle Dashboard JavaScript - Comparison Rendering Function
// Add this function to your script.js file

// PYT Hairstyle Dashboard JavaScript - Complete Comparison Rendering Function

function renderPYTSheetComparison(data1, data2, sheet1, sheet2) {
  const container = document.getElementById("employeeReports");

  let html = `
    <div class="comparison-view" style="background: linear-gradient(135deg, #f8f9ff, #fff0f5); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h2>💇‍♀️ PYT Hairstyle Comparison: ${sheet1.toUpperCase()} vs ${sheet2.toUpperCase()}</h2>
        
        <div class="comparison-section">
            <div class="comparison-header" style="background: linear-gradient(135deg, #764ba2, #667eea);">🏪 Salon Performance Comparison</div>
            <div style="padding: 15px;">
                <table class="comparison-table" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="background: #764ba2; color: white; padding: 12px; border: 1px solid #ddd;">Salon Metric</th>
                        <th style="background: #764ba2; color: white; padding: 12px; border: 1px solid #ddd;">${sheet1.toUpperCase()}</th>
                        <th style="background: #764ba2; color: white; padding: 12px; border: 1px solid #ddd;">${sheet2.toUpperCase()}</th>
                        <th style="background: #764ba2; color: white; padding: 12px; border: 1px solid #ddd;">Difference</th>
                        <th style="background: #764ba2; color: white; padding: 12px; border: 1px solid #ddd;">Change %</th>
                    </tr>
  `;

  // Shop metrics comparison
  if (data1.shopMetrics && data2.shopMetrics) {
    const metrics = [
      {
        key: "totalSales",
        label: "Total Salon Sales",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "totalSalaries",
        label: "Total Payroll",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "shopEfficiency",
        label: "Salon Efficiency",
        format: (v) => `${v.toFixed(2)}%`,
      },
    ];

    metrics.forEach((metric) => {
      const val1 = data1.shopMetrics[metric.key] || 0;
      const val2 = data2.shopMetrics[metric.key] || 0;
      const diff = val1 - val2;
      const changePercent = val2 !== 0 ? (diff / val2) * 100 : 0;

      html += `
        <tr style="border: 1px solid #ddd;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>${
            metric.label
          }</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${metric.format(
            val1
          )}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${metric.format(
            val2
          )}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${
            diff > 0 ? "+" : ""
          }${metric.format(Math.abs(diff))}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: ${
            changePercent > 0 ? "#4CAF50" : "#F44336"
          };">${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%</td>
        </tr>
      `;
    });
  }

  html += `
                </table>
            </div>
        </div>
        
        <h3 style="color: #764ba2;">💇‍♀️ Stylist Performance Comparison</h3>
  `;

  // Get all unique employees
  const allEmployees = new Set();
  data1.employees?.forEach((emp) => allEmployees.add(emp.name));
  data2.employees?.forEach((emp) => allEmployees.add(emp.name));

  // Employee comparisons
  Array.from(allEmployees)
    .sort()
    .forEach((employeeName) => {
      const emp1 = data1.employees?.find((e) => e.name === employeeName);
      const emp2 = data2.employees?.find((e) => e.name === employeeName);

      html += `
        <div class="comparison-section" style="margin: 20px 0; border: 1px solid #764ba2; border-radius: 8px; overflow: hidden;">
            <div class="comparison-header" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px;">
                💇‍♀️ ${employeeName} - Performance Comparison
            </div>
            <div style="padding: 15px;">
                <table class="comparison-table" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <th style="background: #f8f9ff; color: #764ba2; padding: 10px; border: 1px solid #ddd;">Metric</th>
                        <th style="background: #f8f9ff; color: #764ba2; padding: 10px; border: 1px solid #ddd;">${sheet1.toUpperCase()}</th>
                        <th style="background: #f8f9ff; color: #764ba2; padding: 10px; border: 1px solid #ddd;">${sheet2.toUpperCase()}</th>
                        <th style="background: #f8f9ff; color: #764ba2; padding: 10px; border: 1px solid #ddd;">Difference</th>
                        <th style="background: #f8f9ff; color: #764ba2; padding: 10px; border: 1px solid #ddd;">Change %</th>
                    </tr>
      `;

      const comparisonMetrics = [
        {
          key: "adjustedSales",
          label: "Total Sales",
          format: (v) => `£${v.toLocaleString()}`,
        },
        {
          key: "finalTotal",
          label: "Total Pay",
          format: (v) => `£${v.toLocaleString()}`,
        },
        {
          key: "workedHours",
          label: "Hours Worked",
          format: (v) => v.toFixed(1),
        },
        {
          key: "avgSalesPerDay",
          label: "Avg Sales/Day",
          format: (v) => `£${v.toFixed(0)}`,
        },
      ];

      comparisonMetrics.forEach((metric) => {
        const val1 = emp1?.[metric.key];
        const val2 = emp2?.[metric.key];

        if (val1 !== undefined && val2 !== undefined) {
          const diff = val1 - val2;
          const changePercent = val2 !== 0 ? (diff / val2) * 100 : 0;

          html += `
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 8px; border: 1px solid #ddd;">${
                metric.label
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${metric.format(
                val1
              )}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${metric.format(
                val2
              )}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${
                diff > 0 ? "+" : ""
              }${metric.format(Math.abs(diff))}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: ${
                changePercent > 0 ? "#4CAF50" : "#F44336"
              };">${changePercent > 0 ? "+" : ""}${changePercent.toFixed(
            1
          )}%</td>
            </tr>
          `;
        } else {
          html += `
            <tr style="border: 1px solid #ddd;">
              <td style="padding: 8px; border: 1px solid #ddd;">${
                metric.label
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                val1 ? metric.format(val1) : "N/A"
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                val2 ? metric.format(val2) : "N/A"
              }</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">N/A</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">N/A</td>
            </tr>
          `;
        }
      });

      html += `
                </table>
            </div>
        </div>
      `;
    });

  html += "</div>";
  container.innerHTML = html;
  showStatus(
    `PYT Hairstyle comparison completed: ${sheet1} vs ${sheet2}`,
    "success"
  );
}
function debugCSVStructure(csvText) {
  const lines = csvText.split("\n");
  console.log("🔍 DEBUG: Analyzing CSV structure...");

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());
    console.log(`Row ${i}: [${columns.length} columns]`);

    // Show first 10 columns with their indices
    for (let j = 0; j < Math.min(10, columns.length); j++) {
      console.log(`  [${j}]: "${columns[j]}"`);
    }

    if (i === 0) {
      console.log("📋 This should be your header row");
    }
    console.log("---");
  }

  // Look for SHOP_METRICS row specifically
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());

    if (columns[0] === "SHOP_METRICS") {
      console.log(`🎯 SHOP_METRICS found at row ${i}:`);
      for (let j = 0; j < columns.length; j++) {
        console.log(`  [${j}]: "${columns[j]}"`);
      }
      break;
    }
  }
}
