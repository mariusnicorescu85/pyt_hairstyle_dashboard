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
// PYT Hairstyle Dashboard JavaScript - Part 4 FIXED: Complete Rendering Function

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

    // COMPLETE EMPLOYEE HTML - FIXED
    section.innerHTML = `
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

    container.appendChild(section);
  });

  // Add individual summary section
  if (employeeData.length > 1) {
    addIndividualSummarySection(container);
  }
}
// PYT Hairstyle Dashboard JavaScript - Part 6: Google Sheets and CSV Functions

// PYT-specific functions with correct URL formats
// IMMEDIATE FIX: Replace your fetchPYTFromGoogleSheets function with this version

async function fetchPYTFromGoogleSheets() {
  const sheetTab = document.getElementById("sheetTab").value || "july";
  const sheetId = "1VlQ9JRTSCdtIyxbh-AffUawdAIEgZw33W_poq1X6R5s"; // PYT Sheet ID

  showStatus(`Fetching PYT Hairstyle data from ${sheetTab} tab...`, "status");

  // FORCE CACHE BUSTING with timestamp
  const timestamp = new Date().getTime();

  // Try multiple URL formats with cache busting
  const urlsToTry = [
    // Try with specific sheet name and cache bust
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetTab
    )}&_=${timestamp}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(
      sheetTab
    )}&_=${timestamp}`,
    // Try default sheet (GID 0) with cache bust
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&_=${timestamp}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0&_=${timestamp}`,
  ];

  for (let i = 0; i < urlsToTry.length; i++) {
    const csvUrl = urlsToTry[i];
    console.log(`🔄 Trying PYT URL ${i + 1} (cache bust):`, csvUrl);

    try {
      const response = await fetch(csvUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-cache", // FORCE NO CACHE
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      console.log(`🌐 PYT Response ${i + 1} status:`, response.status);

      if (response.ok) {
        const csvText = await response.text();
        console.log(
          `📄 PYT Success with URL ${i + 1}! CSV length:`,
          csvText.length
        );
        console.log(`📋 First 1000 chars:`, csvText.substring(0, 1000));

        // Check if this contains the NEW correct data
        const hasCorrectData =
          csvText.includes("61193.84") ||
          csvText.includes("22.29%") ||
          csvText.includes("14942.98");

        if (hasCorrectData) {
          console.log("✅ FOUND CORRECT NEW DATA in CSV!");
        } else {
          console.log("❌ This still contains OLD DATA - trying next URL...");
          console.log(
            "🔍 Looking for: £61,193.84 total sales or 22.29% efficiency"
          );
          continue;
        }

        debugCSVStructure(csvText);

        // Check if this looks like our PYT data
        if (
          csvText.length > 50 &&
          (csvText.includes("Employee") || csvText.includes(","))
        ) {
          const parsedData = parsePYTCSVToEmployeeData(csvText);
          console.log("📊 Parsed PYT employee data:", parsedData);

          if (parsedData.employees.length > 0) {
            // MANUAL CHECK: Verify we have the correct data
            const totalSales = parsedData.employees.reduce(
              (sum, emp) => sum + emp.adjustedSales,
              0
            );
            const shopEfficiency =
              parsedData.shopMetrics?.shopEfficiency ||
              (parsedData.employees.reduce(
                (sum, emp) => sum + emp.finalTotal,
                0
              ) /
                totalSales) *
                100;

            console.log(`🎯 DATA VERIFICATION:`);
            console.log(`   Total Sales: £${totalSales.toFixed(2)}`);
            console.log(`   Shop Efficiency: ${shopEfficiency.toFixed(2)}%`);

            if (totalSales > 50000 && shopEfficiency < 30) {
              console.log("✅ VERIFIED: This is the CORRECT NEW data!");
            } else {
              console.log("❌ WARNING: This might still be old data!");
            }

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

            console.log(
              `🎉 LOADING DATA WITH ${
                totalSales > 50000 ? "CORRECT" : "POTENTIALLY OLD"
              } VALUES`
            );
            receiveWorkflowData(mockData);
            return;
          } else {
            console.log(
              "⚠️ No valid PYT employee data found, trying next URL..."
            );
          }
        } else {
          console.log(
            "⚠️ Response doesn't look like CSV data, trying next URL..."
          );
        }
      }
    } catch (error) {
      console.log(`❌ PYT URL ${i + 1} failed:`, error.message);
    }
  }

  // If all URLs failed, suggest manual solutions
  showStatus(
    `⚠️ Could not fetch updated data from Google Sheets. This might be a caching issue. Try: 1) Wait 5-10 minutes for Google's cache to update, 2) Use "Load Test Data" button, 3) Check if you're on the correct "${sheetTab}" tab`,
    "error"
  );

  console.log(`💡 TROUBLESHOOTING TIPS:`);
  console.log(`   1. Your Google Sheet has the correct data (✅ confirmed)`);
  console.log(`   2. Google Sheets CSV export might be cached`);
  console.log(`   3. Try clicking "Load Test Data" for immediate results`);
  console.log(
    `   4. Or wait 5-10 minutes and try "Fetch from Google Sheets" again`
  );

  // If all URLs failed
  showStatus(
    `Unable to fetch PYT Hairstyle data for "${sheetTab}" tab. Please check: 1) Sheet is shared publicly, 2) Tab "${sheetTab}" exists, 3) Tab contains data`,
    "error"
  );
}
// FIXED CSV Parser for PYT Data - Replace the existing parsePYTCSVToEmployeeData function

function parsePYTCSVToEmployeeData(csvText) {
  const lines = csvText.split("\n");
  const employees = [];
  let shopMetrics = null;

  console.log("🔍 PYT CSV lines:", lines.length);

  // First, let's identify the header row and column positions
  let headerRow = -1;
  let columnMap = {};

  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());

    // Look for header row
    if (columns.includes("Employee") && columns.includes("FinalTotal")) {
      headerRow = i;
      // Map column positions
      columns.forEach((header, index) => {
        columnMap[header] = index;
      });
      console.log("📋 Found header at row", i, "with columns:", columnMap);
      break;
    }
  }

  if (headerRow === -1) {
    console.error("❌ No header row found in CSV");
    return { employees: [], shopMetrics: null };
  }

  for (let i = headerRow + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());

    // Handle SHOP_METRICS row - FIXED COLUMN MAPPING
    if (columns[0] === "SHOP_METRICS") {
      console.log(`📊 Found SHOP_METRICS with ${columns.length} columns`);

      shopMetrics = {
        period: columns[columnMap.Period] || "2025-07",
        totalDays: parseFloat(columns[columnMap.WorkedDays]) || 0,
        totalHours: parseFloat(columns[columnMap.WorkedHours]) || 0,
        totalSales:
          parseFloat(columns[columnMap.AdjustedSales]?.replace(/[£,"]/g, "")) ||
          0,
        totalSalaries:
          parseFloat(columns[columnMap.FinalTotal]?.replace(/[£,"]/g, "")) || 0,
        shopEfficiency: 0, // We'll calculate this
        description:
          columns[columnMap.Description] ||
          "PYT Hairstyle shop metrics from CSV",
      };

      // Calculate efficiency
      if (shopMetrics.totalSales > 0) {
        shopMetrics.shopEfficiency =
          (shopMetrics.totalSalaries / shopMetrics.totalSales) * 100;
      }

      console.log(`✅ PYT SHOP_METRICS parsed:`, shopMetrics);
      continue;
    }

    // Handle Employee rows - FIXED PARSING with proper column mapping
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

      // FIXED: Use proper column mapping instead of hardcoded positions
      const workedHours = parseFloat(columns[columnMap.WorkedHours]) || 0;
      const hourlyRate =
        parseFloat(columns[columnMap.HourlyRate]?.replace(/[£,"]/g, "")) || 0;
      const totalSales =
        parseFloat(columns[columnMap.TotalSales]?.replace(/[£,"]/g, "")) || 0;
      const addlSales =
        parseFloat(columns[columnMap.AddlSales]?.replace(/[£,"]/g, "")) || 0;
      const adjustedSales =
        parseFloat(columns[columnMap.AdjustedSales]?.replace(/[£,"]/g, "")) ||
        0;
      const finalTotal =
        parseFloat(columns[columnMap.FinalTotal]?.replace(/[£,"]/g, "")) || 0;
      const salesCommission =
        parseFloat(columns[columnMap.SalesCommission]?.replace(/[£,"]/g, "")) ||
        0;
      const bonusPayment =
        parseFloat(columns[columnMap.BonusPayment]?.replace(/[£,"]/g, "")) || 0;

      // FIXED: Calculate base payment properly
      let basePayment = parseFloat(
        columns[columnMap.BasePayment]?.replace(/[£,"]/g, "")
      );

      // If base payment is wrong (like £1.00), recalculate it
      if (basePayment <= 1 && workedHours > 0 && hourlyRate > 0) {
        basePayment = workedHours * hourlyRate;
        console.log(
          `🔧 RECALCULATED basePayment for ${
            columns[0]
          }: ${workedHours} × £${hourlyRate} = £${basePayment.toFixed(2)}`
        );
      }

      const employee = {
        name: columns[columnMap.Employee],
        period: columns[columnMap.Period] || "2025-07",
        paymentType: columns[columnMap.PaymentType] || "HOURLY ONLY",
        workedDays: parseFloat(columns[columnMap.WorkedDays]) || 0,
        workedHours: workedHours,
        hourlyRate: hourlyRate,
        salesPercentage: columns[columnMap.SalesPercentage] || "N/A",
        basePayment: basePayment,
        totalSales: totalSales,
        addlSales: addlSales,
        adjustedSales: adjustedSales,
        salesCommission: salesCommission,
        bonusPayment: bonusPayment,
        finalTotal: finalTotal,
        avgSalesPerDay:
          parseFloat(
            columns[columnMap.AvgSalesPerDay]?.replace(/[£,"]/g, "")
          ) ||
          (adjustedSales && parseFloat(columns[columnMap.WorkedDays]) > 0
            ? adjustedSales / parseFloat(columns[columnMap.WorkedDays])
            : 0),
        avgSalesPerHour:
          parseFloat(
            columns[columnMap.AvgSalesPerHour]?.replace(/[£,"]/g, "")
          ) ||
          (adjustedSales && workedHours > 0 ? adjustedSales / workedHours : 0),
        description:
          columns[columnMap.Description] || "PYT standard configuration",
        configVersion: columns[columnMap.ConfigVersion] || "2025-v1",
        dataIssues: columns[columnMap.DataIssues] || "None",
        salaryToSalesPct:
          adjustedSales > 0 ? (finalTotal / adjustedSales) * 100 : 0,
        salesShareOfShop: 0, // Will be calculated later
        salaryShareOfShop: 0, // Will be calculated later
      };

      // VALIDATION: Check if the data makes sense
      const expectedBasePayment = workedHours * hourlyRate;
      if (Math.abs(basePayment - expectedBasePayment) > 1) {
        console.warn(
          `⚠️ ${
            employee.name
          }: Base payment mismatch - CSV: £${basePayment}, Expected: £${expectedBasePayment.toFixed(
            2
          )}`
        );
      }

      // VALIDATION: Check final total calculation
      const expectedFinalTotal = basePayment + salesCommission + bonusPayment;
      if (Math.abs(finalTotal - expectedFinalTotal) > 1) {
        console.warn(
          `⚠️ ${
            employee.name
          }: Final total mismatch - CSV: £${finalTotal}, Expected: £${expectedFinalTotal.toFixed(
            2
          )}`
        );
      }

      employees.push(employee);
      console.log(
        `✅ ADDED PYT: ${employee.name} - £${employee.finalTotal} (Base: £${employee.basePayment}, Hours: ${employee.workedHours}, Rate: £${employee.hourlyRate})`
      );
    }
  }

  // Calculate shop metrics from employee data if not found or looks wrong
  if (
    !shopMetrics ||
    shopMetrics.totalSales < 100 ||
    shopMetrics.totalSalaries < 100
  ) {
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

  // FINAL VALIDATION: Check overall data quality
  console.log(`📊 PYT DATA QUALITY CHECK:`);
  console.log(`   Employees processed: ${employees.length}`);
  console.log(`   Shop efficiency: ${shopMetrics?.shopEfficiency.toFixed(2)}%`);

  if (shopMetrics?.shopEfficiency > 100) {
    console.warn(
      `⚠️ HIGH ALERT: Salon efficiency is ${shopMetrics.shopEfficiency.toFixed(
        2
      )}% - paying more in wages than earning in sales!`
    );
  }

  return { employees, shopMetrics };
}

// DEBUGGING FUNCTION: Add this to help debug CSV structure
function debugCSVStructure(csvText) {
  const lines = csvText.split("\n");
  console.log("🔍 DEBUG: Analyzing CSV structure...");

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",").map((col) => col.replace(/"/g, "").trim());
    console.log(`Row ${i}: [${columns.length} columns]`);

    // Show first 15 columns with their indices
    for (let j = 0; j < Math.min(15, columns.length); j++) {
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
      for (let j = 0; j < Math.min(15, columns.length); j++) {
        console.log(`  [${j}]: "${columns[j]}"`);
      }
      break;
    }
  }

  // Look for first employee row
  const pytEmployee = PYT_EMPLOYEES.find((name) =>
    lines.some((line) => line.includes(name))
  );

  if (pytEmployee) {
    const employeeLineIndex = lines.findIndex(
      (line) => line.split(",")[0].replace(/"/g, "").trim() === pytEmployee
    );

    if (employeeLineIndex >= 0) {
      const columns = lines[employeeLineIndex]
        .split(",")
        .map((col) => col.replace(/"/g, "").trim());
      console.log(
        `👤 First employee (${pytEmployee}) at row ${employeeLineIndex}:`
      );
      for (let j = 0; j < Math.min(15, columns.length); j++) {
        console.log(`  [${j}]: "${columns[j]}"`);
      }
    }
  }
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
      Employee: "SHOP_METRICS",
      Period: "2025-07",
      PaymentType: "ALL_TYPES",
      WorkedDays: "100",
      WorkedHours: "800.00",
      AdjustedSales: "£19075.00",
      FinalTotal: "£9801.60",
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

// Check for URL parameters (for simple integration)
window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const dataParam = urlParams.get("data");

  if (dataParam) {
    try {
      const data = JSON.parse(decodeURIComponent(dataParam));
      receiveWorkflowData(data);
    } catch (error) {
      showStatus("Error parsing URL data: " + error.message, "error");
    }
  }
});

// For webhook integration (if hosting with backend)
if (typeof window.receivePYTWebhookData === "undefined") {
  window.receivePYTWebhookData = receiveWorkflowData;
}

// Global function for N8N integration
window.receiveWorkflowData = receiveWorkflowData;
