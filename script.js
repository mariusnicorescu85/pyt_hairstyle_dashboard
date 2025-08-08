// ===== PYT HAIRSTYLE DASHBOARD JAVASCRIPT =====

// Global Variables
let employeeData = [];
let shopMetrics = null;
let monthlyDataStore = {};

// Utility Functions
const money = (v) => parseFloat(String(v ?? "").replace(/[^0-9.-]+/g, "")) || 0;
const pct = (v) => parseFloat(String(v ?? "").replace(/[^0-9.-]+/g, "")) || 0;

// Header Mapping Configuration
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

const HEADER_MAP = {
  employee: "Employee",
  period: "Period",
  paymenttype: "PaymentType",
  paymenttypehourlyonly: "PaymentType",
  workeddays: "WorkedDays",
  workedhours: "WorkedHours",
  hourlyrate: "HourlyRate",
  salespercentage: "SalesPercentage",
  salespercxentage: "SalesPercentage",
  sales: "SalesPercentage",
  basepayment: "BasePayment",
  totalsales: "TotalSales",
  addlsales: "AddlSales",
  additionalsales: "AddlSales",
  adjustedsales: "AdjustedSales",
  salescommission: "SalesCommission",
  bonuspayment: "BonusPayment",
  totalbeforebonus: "TotalBeforeBonus",
  finaltotal: "FinalTotal",
  finaltotalpayment: "FinalTotal",
  avgsalesperday: "AvgSalesPerDay",
  avgsalesday: "AvgSalesPerDay",
  avgsalesperhour: "AvgSalesPerHour",
  avgsaleshour: "AvgSalesPerHour",
  description: "Description",
  configversion: "ConfigVersion",
  dataissues: "DataIssues",
  salaryvsownsales: "SalaryToSalesPct",
  salarytosalespct: "SalaryToSalesPct",
  salesshareofshop: "SalesShareOfShop",
  salaryshareofshop: "SalaryShareOfShop",
  paymenttypealltypes: "PaymentType",
};

function remapHeadersRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const mapped = HEADER_MAP[norm(k)] || k;
    out[mapped] = v;
  }
  return out;
}

// Main Data Processing Functions
function receiveWorkflowData(data) {
  try {
    console.log("Raw data received:", data);

    const rows = Array.isArray(data)
      ? data
      : data && Array.isArray(data.data)
      ? data.data
      : [data];

    const mappedRows = rows.map(remapHeadersRow);
    console.log("Sample mapped row:", mappedRows[0]);

    const parsed = parseN8NData(mappedRows);

    employeeData = parsed.employees;
    shopMetrics = parsed.shopMetrics;
    console.log("Parsed employees:", employeeData);
    console.log("Shop metrics:", shopMetrics);

    renderEmployeeReports();
    document.getElementById("lastUpdated").textContent =
      new Date().toLocaleString();
    showStatus(
      `Data received successfully! Found ${employeeData.length} employees.`,
      "success"
    );
  } catch (error) {
    showStatus("Error processing data: " + error.message, "error");
    console.error("Data processing error:", error);
    console.error("Raw data:", data);
  }
}

function parseN8NData(rawData) {
  console.log("Starting to parse data:", rawData);
  const employees = [];
  let shopMetrics = null;

  const dataArray = Array.isArray(rawData) ? rawData : [rawData];
  console.log("Data array length:", dataArray.length);

  for (let i = 0; i < dataArray.length; i++) {
    const item = dataArray[i];
    console.log(`Processing item ${i}:`, item);

    if (!item || typeof item !== "object") {
      console.log(`Skipping item ${i}: not an object`);
      continue;
    }
    if (item.Employee === "Employee") {
      console.log(`Skipping item ${i}: header row`);
      continue;
    }
    if (item.Employee && item.Employee.includes(" - Daily Breakdown")) {
      console.log(`Skipping item ${i}: breakdown header`);
      continue;
    }
    if (item.Employee && item.Employee === "TOTAL_SUMMARY") {
      console.log(`Skipping item ${i}: total summary row`);
      continue;
    }
    if (item.Employee && item.Employee === "SHOP_METRICS") {
      console.log(`Found shop metrics: ${item.Employee}`);
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
        description: item.Description || "Shop efficiency metrics",
      };
      continue;
    }
    if (!item.Employee || item.Employee === "") {
      console.log(`Skipping item ${i}: no employee name`);
      continue;
    }

    if (
      item.Employee &&
      item.Period &&
      item.WorkedDays &&
      !item.Employee.includes(" - ") &&
      item.FinalTotal
    ) {
      console.log(`Found employee: ${item.Employee}`);

      const employee = {
        name: item.Employee,
        period: item.Period,
        paymentType: item.PaymentType || "HYBRID",
        workedDays: parseFloat(item.WorkedDays) || 0,
        workedHours: parseFloat(item.WorkedHours) || 0,
        hourlyRate: money(item.HourlyRate),
        salesPercentage:
          item.SalesPercentage === "Tiered" || item.SalesPercentage === "N/A"
            ? item.SalesPercentage
            : pct(item.SalesPercentage) / 100,
        basePayment: money(item.BasePayment),
        totalSales: money(item.TotalSales),
        addlSales: money(item.AddlSales),
        adjustedSales: money(item.AdjustedSales),
        salesCommission: money(item.SalesCommission),
        bonusPayment: money(item.BonusPayment),
        totalBeforeBonus: money(item.TotalBeforeBonus),
        finalTotal: money(item.FinalTotal),
        avgSalesPerDay: money(item.AvgSalesPerDay),
        avgSalesPerHour: money(item.AvgSalesPerHour),
        description: item.Description || "Standard configuration",
        configVersion: item.ConfigVersion || "N/A",
        dataIssues: item.DataIssues || "None",
        salaryToSalesPct: pct(item.SalaryToSalesPct),
        salesShareOfShop: pct(item.SalesShareOfShop),
        salaryShareOfShop: pct(item.SalaryShareOfShop),
      };

      console.log("Created employee object:", employee);
      employees.push(employee);
    }
  }

  if (!shopMetrics && employees.length > 0) {
    const totalSales = employees.reduce((s, e) => s + e.adjustedSales, 0);
    const totalSalaries = employees.reduce((s, e) => s + e.finalTotal, 0);
    const totalDays = employees.reduce((s, e) => s + (e.workedDays || 0), 0);
    const totalHours = employees.reduce((s, e) => s + (e.workedHours || 0), 0);

    shopMetrics = {
      period: employees[0]?.period || "unknown",
      totalDays,
      totalHours,
      totalSales,
      totalSalaries,
      shopEfficiency: totalSales ? (totalSalaries / totalSales) * 100 : 0,
      description: "Shop efficiency metrics (computed)",
    };
  }

  console.log("Final employees array:", employees);
  console.log("Final shop metrics:", shopMetrics);
  return { employees, shopMetrics };
}

// Efficiency Rating Functions
function getEfficiencyRating(salaryToSales, salesShare) {
  if (salesShare > 15 && salaryToSales < 25) return "⭐⭐⭐ Excellent";
  if (salesShare > 10 && salaryToSales < 35) return "⭐⭐ Good";
  if (salesShare > 5 && salaryToSales < 50) return "⭐ Fair";
  if (salaryToSales > 0) return "⚠️ Needs Improvement";
  return "📊 No Sales Data";
}

function getShopEfficiencyRating(efficiency) {
  if (efficiency < 15) return "🌟 Excellent Efficiency";
  if (efficiency < 20) return "✅ Very Good";
  if (efficiency < 25) return "👍 Good";
  if (efficiency < 30) return "⚠️ Acceptable";
  return "🔴 Needs Optimization";
}

function showStatus(message, type = "status") {
  const statusElement = document.getElementById("status");
  statusElement.textContent = message;
  statusElement.className = type;
}

// Rendering Functions
function renderEmployeeReports() {
  const container = document.getElementById("employeeReports");
  container.innerHTML = "";

  if (employeeData.length === 0) {
    container.innerHTML =
      '<div class="status">No employee data available</div>';
    return;
  }

  if (shopMetrics) {
    addShopSummarySection(container);
  }

  employeeData.forEach((emp, index) => {
    const section = document.createElement("div");
    section.className = "employee-section";

    section.innerHTML = `
      <div class="employee-header">
        ${emp.name} - ${emp.period}
        <span style="float: right; font-size: 14px;">
          ${emp.paymentType} | Total: £${emp.finalTotal.toFixed(2)} | 
          <span style="color: ${
            (emp.finalTotal / emp.adjustedSales) * 100 < 30
              ? "#4CAF50"
              : (emp.finalTotal / emp.adjustedSales) * 100 < 50
              ? "#FF9800"
              : "#F44336"
          };">
            ${((emp.finalTotal / emp.adjustedSales) * 100).toFixed(1)}%
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
            <td><strong>Payment Structure</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Payment Type</td>
            <td>${emp.paymentType}</td>
            <td>${emp.description}</td>
          </tr>
          <tr>
            <td>Config Version</td>
            <td>${emp.configVersion}</td>
            <td>Configuration tracking</td>
          </tr>
          <tr>
            <td>Data Quality</td>
            <td>${emp.dataIssues}</td>
            <td>Data validation results</td>
          </tr>
          <tr>
            <td><strong>Work Summary</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Worked Days</td>
            <td>${emp.workedDays}</td>
            <td>Total working days in period</td>
          </tr>
          <tr>
            <td>Worked Hours</td>
            <td>${emp.workedHours.toFixed(2)}</td>
            <td>Total hours logged</td>
          </tr>
          <tr>
            <td>Hourly Rate</td>
            <td class="currency">£${emp.hourlyRate.toFixed(2)}</td>
            <td>Base hourly payment rate</td>
          </tr>
          <tr>
            <td><strong>Sales & Commission</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Sales Commission Rate</td>
            <td>${
              typeof emp.salesPercentage === "string"
                ? emp.salesPercentage
                : (emp.salesPercentage * 100).toFixed(1) + "%"
            }</td>
            <td>Commission percentage on sales</td>
          </tr>
          <tr>
            <td>Total Sales</td>
            <td class="currency">£${emp.totalSales.toFixed(2)}</td>
            <td>Regular sales amount</td>
          </tr>
          <tr>
            <td>Additional Sales</td>
            <td class="currency">£${emp.addlSales.toFixed(2)}</td>
            <td>Extra sales/bonuses</td>
          </tr>
          <tr>
            <td>Adjusted Sales</td>
            <td class="currency">£${emp.adjustedSales.toFixed(2)}</td>
            <td>Total + Additional sales</td>
          </tr>
          <tr>
            <td><strong>Payment Calculation</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Base Payment</td>
            <td class="currency">£${emp.basePayment.toFixed(2)}</td>
            <td>${emp.workedHours.toFixed(2)} hours × £${emp.hourlyRate.toFixed(
      2
    )}/hour</td>
          </tr>
          <tr>
            <td>Sales Commission</td>
            <td class="currency">£${emp.salesCommission.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} × ${
      typeof emp.salesPercentage === "string"
        ? emp.salesPercentage
        : (emp.salesPercentage * 100).toFixed(1) + "%"
    }</td>
          </tr>
          <tr>
            <td>Bonus Payment</td>
            <td class="currency">£${emp.bonusPayment.toFixed(2)}</td>
            <td>Additional bonuses/guarantees</td>
          </tr>
          <tr class="totals-row">
            <td><strong>Final Total Payment</strong></td>
            <td class="currency"><strong>£${emp.finalTotal.toFixed(
              2
            )}</strong></td>
            <td><strong>Base + Commission + Bonuses</strong></td>
          </tr>
          <tr>
            <td><strong>Performance Metrics</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr>
            <td>Average Sales per Day</td>
            <td class="currency">£${emp.avgSalesPerDay.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} ÷ ${emp.workedDays} days</td>
          </tr>
          <tr>
            <td>Average Sales per Hour</td>
            <td class="currency">£${emp.avgSalesPerHour.toFixed(2)}</td>
            <td>£${emp.adjustedSales.toFixed(2)} ÷ ${emp.workedHours.toFixed(
      2
    )} hours</td>
          </tr>
          <tr>
            <td>Earnings per Day</td>
            <td class="currency">£${(emp.finalTotal / emp.workedDays).toFixed(
              2
            )}</td>
            <td>Total payment ÷ working days</td>
          </tr>
          <tr>
            <td><strong>Business Efficiency Metrics</strong></td>
            <td colspan="2"></td>
          </tr>
          <tr class="efficiency-row">
            <td>Cost Efficiency</td>
            <td>${((emp.finalTotal / emp.adjustedSales) * 100).toFixed(2)}%</td>
            <td>Salary cost per £1 of sales (lower = better)</td>
          </tr>
          <tr class="efficiency-row">
            <td>Sales Share of Shop</td>
            <td>${
              shopMetrics
                ? ((emp.adjustedSales / shopMetrics.totalSales) * 100).toFixed(
                    2
                  )
                : "0.00"
            }%</td>
            <td>Contribution to total shop sales</td>
          </tr>
          <tr class="efficiency-row">
            <td>Salary Share of Shop</td>
            <td>${
              shopMetrics
                ? ((emp.finalTotal / shopMetrics.totalSalaries) * 100).toFixed(
                    2
                  )
                : "0.00"
            }%</td>
            <td>Proportion of total shop payroll</td>
          </tr>
          <tr class="efficiency-row">
            <td>Efficiency Rating</td>
            <td>${getEfficiencyRating(
              (emp.finalTotal / emp.adjustedSales) * 100,
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

  if (employeeData.length > 1) {
    addIndividualSummarySection(container);
  }
}

function addShopSummarySection(container) {
  const summarySection = document.createElement("div");
  summarySection.className = "employee-section shop-summary";
  summarySection.innerHTML = `
    <div class="employee-header">
      🏪 Shop-Wide Performance Summary - ${shopMetrics.period}
    </div>
    <div class="summary-section">
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>Total Value</th>
          <th>Shop Efficiency Analysis</th>
        </tr>
        <tr>
          <td><strong>Total Sales</strong></td>
          <td class="currency"><strong>£${shopMetrics.totalSales.toFixed(
            2
          )}</strong></td>
          <td>All sales combined across ${employeeData.length} employees</td>
        </tr>
        <tr>
          <td><strong>Total Payroll</strong></td>
          <td class="currency"><strong>£${shopMetrics.totalSalaries.toFixed(
            2
          )}</strong></td>
          <td>All employee payments combined</td>
        </tr>
        <tr class="totals-row">
          <td><strong>Shop Efficiency Ratio</strong></td>
          <td><strong>${shopMetrics.shopEfficiency.toFixed(2)}%</strong></td>
          <td><strong>Salary cost per £1 of sales - ${getShopEfficiencyRating(
            shopMetrics.shopEfficiency
          )}</strong></td>
        </tr>
        <tr>
          <td>Total Hours Worked</td>
          <td>${shopMetrics.totalHours.toFixed(2)}</td>
          <td>Combined work hours across all employees</td>
        </tr>
        <tr>
          <td>Total Working Days</td>
          <td>${shopMetrics.totalDays}</td>
          <td>Combined working days across all employees</td>
        </tr>
        <tr>
          <td>Average Sales per Hour</td>
          <td class="currency">£${(
            shopMetrics.totalSales / shopMetrics.totalHours
          ).toFixed(2)}</td>
          <td>Shop productivity: sales generated per hour worked</td>
        </tr>
        <tr>
          <td>Profit Margin (Est.)</td>
          <td>${(100 - shopMetrics.shopEfficiency).toFixed(2)}%</td>
          <td>Estimated gross margin after salary costs</td>
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
      📊 Individual Employee Summary - ${employeeData.length} Employees
    </div>
    <div class="summary-section">
      <table class="summary-table">
        <tr>
          <th>Metric</th>
          <th>Total</th>
          <th>Average per Employee</th>
        </tr>
        <tr>
          <td>Total Hours Worked</td>
          <td>${totalHours.toFixed(2)}</td>
          <td>${(totalHours / employeeData.length).toFixed(2)}</td>
        </tr>
        <tr>
          <td>Total Sales</td>
          <td class="currency">£${totalSales.toFixed(2)}</td>
          <td class="currency">£${(totalSales / employeeData.length).toFixed(
            2
          )}</td>
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
          <td class="currency"><strong>£${totalPayment.toFixed(2)}</strong></td>
          <td class="currency"><strong>£${(
            totalPayment / employeeData.length
          ).toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>
  `;
  container.appendChild(summarySection);
}

// Google Sheets Integration
async function fetchFromGoogleSheets() {
  const sheetTab = document.getElementById("sheetTab").value || "july";
  const sheetId = "1VlQ9JRTSCdtIyxbh-AffUawdAIEgZw33W_poq1X6R5s";

  showStatus(`Fetching data from Google Sheets (${sheetTab} tab)...`, "status");

  const urlsToTry = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
      sheetTab
    )}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(
      sheetTab
    )}`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`,
  ];

  for (let i = 0; i < urlsToTry.length; i++) {
    const csvUrl = urlsToTry[i];
    console.log(`Trying URL ${i + 1}:`, csvUrl);

    try {
      const response = await fetch(csvUrl, {
        method: "GET",
        mode: "cors",
      });
      if (!response.ok) {
        continue;
      }

      console.log(`Response ${i + 1} status:`, response.status);

      const csvText = await response.text();

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => String(h || "").trim(),
      });

      const rows = (parsed.data || []).map(remapHeadersRow);

      console.log("Headers seen:", parsed.meta?.fields);
      console.log("Sample mapped row:", rows[1]);

      if (rows.length) {
        receiveWorkflowData(rows);
        return;
      }
    } catch (error) {
      console.log(`URL ${i + 1} failed:`, error.message);
    }
  }

  showStatus(
    `Unable to fetch data for "${sheetTab}" tab. Please check: 1) Sheet is shared publicly (Anyone with link can view), 2) Tab "${sheetTab}" exists, 3) Tab contains data`,
    "error"
  );
}

async function fetchAndCompareSheets() {
  const sheet1 = document.getElementById("sheetTab").value || "june";
  const sheet2 = document.getElementById("compareSheet").value;

  if (!sheet2) {
    alert("Please enter a second sheet name to compare with");
    return;
  }

  if (sheet1 === sheet2) {
    alert("Please enter different sheet names to compare");
    return;
  }

  showStatus(`Loading ${sheet1} and ${sheet2} for comparison...`, "status");

  try {
    document.getElementById("sheetTab").value = sheet1;
    await fetchFromGoogleSheets();
    const data1 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
    };

    document.getElementById("sheetTab").value = sheet2;
    await fetchFromGoogleSheets();
    const data2 = {
      employees: JSON.parse(JSON.stringify(employeeData)),
      shopMetrics: shopMetrics ? JSON.parse(JSON.stringify(shopMetrics)) : null,
    };

    renderSheetComparison(data1, data2, sheet1, sheet2);
    document.getElementById("sheetTab").value = sheet1;
  } catch (error) {
    showStatus("Error comparing sheets: " + error.message, "error");
  }
}

function renderSheetComparison(data1, data2, sheet1, sheet2) {
  const container = document.getElementById("employeeReports");

  let html = `
    <div class="comparison-view">
      <h2>📊 Sheet Comparison: ${sheet1.toUpperCase()} vs ${sheet2.toUpperCase()}</h2>
      
      <div class="comparison-section">
        <div class="comparison-header">🏪 Shop Performance Comparison</div>
        <div style="padding: 15px;">
          <table class="comparison-table">
            <tr>
              <th>Metric</th>
              <th>${sheet1.toUpperCase()}</th>
              <th>${sheet2.toUpperCase()}</th>
              <th>Difference</th>
              <th>Change %</th>
            </tr>
  `;

  if (data1.shopMetrics && data2.shopMetrics) {
    const metrics = [
      {
        key: "totalSales",
        label: "Total Sales",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "totalSalaries",
        label: "Total Payroll",
        format: (v) => `£${v.toLocaleString()}`,
      },
      {
        key: "shopEfficiency",
        label: "Shop Efficiency",
        format: (v) => `${v.toFixed(2)}%`,
      },
    ];

    metrics.forEach((metric) => {
      const val1 = data1.shopMetrics[metric.key] || 0;
      const val2 = data2.shopMetrics[metric.key] || 0;
      const diff = val1 - val2;
      const changePercent = val2 !== 0 ? (diff / val2) * 100 : 0;

      html += `
        <tr>
          <td><strong>${metric.label}</strong></td>
          <td>${metric.format(val1)}</td>
          <td>${metric.format(val2)}</td>
          <td>${diff > 0 ? "+" : ""}${metric.format(Math.abs(diff))}</td>
          <td>${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%</td>
        </tr>
      `;
    });
  }

  html += `
          </table>
        </div>
      </div>
      <h3>👥 Employee Performance Comparison</h3>
  `;

  const allEmployees = new Set();
  data1.employees?.forEach((emp) => allEmployees.add(emp.name));
  data2.employees?.forEach((emp) => allEmployees.add(emp.name));

  Array.from(allEmployees)
    .sort()
    .forEach((employeeName) => {
      const emp1 = data1.employees?.find((e) => e.name === employeeName);
      const emp2 = data2.employees?.find((e) => e.name === employeeName);

      html += `
        <div class="comparison-section">
          <div class="comparison-header">
            ${employeeName} - Performance Comparison
          </div>
          <div style="padding: 15px;">
            <table class="comparison-table">
              <tr>
                <th>Metric</th>
                <th>${sheet1.toUpperCase()}</th>
                <th>${sheet2.toUpperCase()}</th>
                <th>Difference</th>
                <th>Change %</th>
              </tr>
      `;

      const comparisonMetrics = [
        {
          key: "adjustedSales",
          label: "Sales",
          format: (v) => `£${v.toLocaleString()}`,
        },
        {
          key: "finalTotal",
          label: "Salary",
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
            <tr>
              <td>${metric.label}</td>
              <td>${metric.format(val1)}</td>
              <td>${metric.format(val2)}</td>
              <td>${diff > 0 ? "+" : ""}${metric.format(Math.abs(diff))}</td>
              <td>${changePercent > 0 ? "+" : ""}${changePercent.toFixed(
            1
          )}%</td>
            </tr>
          `;
        } else {
          html += `
            <tr>
              <td>${metric.label}</td>
              <td>${val1 ? metric.format(val1) : "N/A"}</td>
              <td>${val2 ? metric.format(val2) : "N/A"}</td>
              <td>N/A</td>
              <td>N/A</td>
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
  showStatus(`Comparison completed: ${sheet1} vs ${sheet2}`, "success");
}

// Test Data and Utility Functions
function loadTestData() {
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
      Employee: "Aisha",
      Period: "2025-07",
      PaymentType: "HOURLY ONLY",
      WorkedDays: "14",
      WorkedHours: "79.82",
      HourlyRate: "£12.21",
      SalesPercentage: "N/A",
      BasePayment: "£974.62",
      TotalSales: "£2234.98",
      AddlSales: "£135.00",
      AdjustedSales: "£2369.98",
      SalesCommission: "£0.00",
      BonusPayment: "£0.00",
      FinalTotal: "£974.62",
      AvgSalesPerDay: "£169.28",
      AvgSalesPerHour: "£29.69",
      Description: "£12.21 per hour, no commission",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "41.13%",
      SalesShareOfShop: "7.58%",
      SalaryShareOfShop: "11.37%",
    },
    {
      Employee: "SHOP_METRICS",
      Period: "2025-07",
      PaymentType: "ALL_TYPES",
      WorkedDays: "318",
      WorkedHours: "1587.45",
      AdjustedSales: "£31245.87",
      FinalTotal: "£8567.42",
      Description: "Shop efficiency: 27.42% salary cost of total sales",
      ConfigVersion: "2025-v1",
      DataIssues: "None",
      SalaryToSalesPct: "27.42%",
      SalesShareOfShop: "100.00%",
      SalaryShareOfShop: "100.00%",
    },
  ];

  receiveWorkflowData(testData);
}

function clearData() {
  employeeData = [];
  shopMetrics = null;
  document.getElementById("employeeReports").innerHTML = "";
  document.getElementById("status").className = "status";
  document.getElementById("status").textContent =
    "Data cleared. Waiting for new data...";
  document.getElementById("lastUpdated").textContent = "Not yet loaded";
}

function exportToExcel() {
  if (employeeData.length === 0) {
    alert("No data to export");
    return;
  }

  const wb = XLSX.utils.book_new();

  const summaryData = [
    ["Employee Payment Report - Generated from N8N Workflow"],
    ["Generated:", new Date().toLocaleString()],
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
      "Efficiency Rating",
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
        : (emp.salesPercentage * 100).toFixed(1) + "%",
      emp.basePayment.toFixed(2),
      emp.totalSales.toFixed(2),
      emp.addlSales.toFixed(2),
      emp.adjustedSales.toFixed(2),
      emp.salesCommission.toFixed(2),
      emp.bonusPayment.toFixed(2),
      emp.finalTotal.toFixed(2),
      emp.avgSalesPerDay.toFixed(2),
      emp.avgSalesPerHour.toFixed(2),
      emp.salaryToSalesPct.toFixed(2) + "%",
      emp.salesShareOfShop.toFixed(2) + "%",
      emp.salaryShareOfShop.toFixed(2) + "%",
      getEfficiencyRating(emp.salaryToSalesPct, emp.salesShareOfShop),
    ]);
  });

  if (shopMetrics) {
    summaryData.push([]);
    summaryData.push(["SHOP SUMMARY"]);
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
      "Shop Efficiency",
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
  }

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "Payment Summary");

  const filename = `Employee_Payments_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Multi-Month Functionality
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
    "Multi-month comparison feature coming soon! For now, use the 'Compare Two Sheets' button above."
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

// URL Parameter Handling
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

// Global function for webhook integration
if (typeof window.receiveWebhookData === "undefined") {
  window.receiveWebhookData = receiveWorkflowData;
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeMonthlyTabs();
});
