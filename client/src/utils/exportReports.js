
import * as XLSX from 'xlsx';

// Export utility functions
const exportToExcel = (sheets, filename) => {
  try {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      
      // Set column widths for better formatting
      const colWidths = sheet.data.length > 0 
        ? Object.keys(sheet.data[0]).map(() => ({ wch: 20 }))
        : [];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
    });
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

const exportToCSV = (data, filename) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

// Format data for different report types
const formatSalesPipelineData = (pipelineData) => {
  if (!pipelineData || !pipelineData.data) return [];
  
  return pipelineData.data.map(stage => ({
    'Stage': stage.stageName || stage.stage,
    'Deal Count': stage.dealCount || stage.deals || 0,
    'Total Value': stage.totalValue || stage.value || 0,
    'Average Deal Size': stage.avgDealSize || 0,
    'Win Probability (%)': stage.probability || stage.winRate || 0,
    'Average Time (Days)': stage.avgTime || stage.avgDaysInStage || 0
  }));
};

const formatRevenueForecastData = (forecastData) => {
  if (!forecastData || !forecastData.monthlyForecast) return [];
  
  return forecastData.monthlyForecast.map(forecast => ({
    'Month': forecast.month,
    'Predicted Revenue': forecast.predicted || 0,
    'Actual Revenue': forecast.actual || 'TBD',
    'Variance (%)': forecast.variance !== null ? forecast.variance : 'TBD',
    'Confidence (%)': forecast.confidence || 0
  }));
};

const formatCustomerAnalysisData = (customerData) => {
  if (!customerData || !customerData.customers) return [];
  
  return customerData.customers.map(customer => ({
    'Customer Name': customer.name,
    'Industry': customer.industry,
    'Total Revenue': customer.totalRevenue || 0,
    'Deal Count': customer.dealCount || 0,
    'Average Deal Size': customer.avgDealSize || 0,
    'Last Activity': customer.lastActivity,
    'Status': customer.status
  }));
};

const formatPerformanceData = (performanceData) => {
  if (!performanceData || !performanceData.salesReps) return [];
  
  return performanceData.salesReps.map(rep => ({
    'Sales Rep': rep.name,
    'Revenue': rep.revenue || 0,
    'Deals Closed': rep.dealsCount || 0,
    'Target Achievement (%)': rep.targetAchievement || 0,
    'Average Deal Size': rep.avgDealSize || 0,
    'Conversion Rate (%)': rep.conversionRate || 0
  }));
};

// Main export functions
export const exportCurrentReports = async (filteredReports, reportData) => {
  if (!filteredReports || filteredReports.length === 0) {
    alert('No reports to export');
    return false;
  }

  const sheets = [];
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  for (const report of filteredReports) {
    let formattedData = [];
    let sheetName = report.name;

    // Format data based on report type
    switch (report.type) {
      case 'pipeline':
        formattedData = formatSalesPipelineData(reportData.pipelineData);
        sheetName = 'Sales Pipeline';
        break;
      case 'forecast':
        formattedData = formatRevenueForecastData(reportData.forecastData);
        sheetName = 'Revenue Forecast';
        break;
      case 'customer':
        formattedData = formatCustomerAnalysisData(reportData.customerData);
        sheetName = 'Customer Analysis';
        break;
      case 'performance':
        formattedData = formatPerformanceData(reportData.performanceData);
        sheetName = 'Performance';
        break;
      default:
        // Generic format for unknown report types
        formattedData = reportData[report.type] || [];
    }

    if (formattedData.length > 0) {
      sheets.push({
        data: formattedData,
        sheetName: sheetName.substring(0, 31) // Excel sheet name limit
      });
    }
  }

  if (sheets.length === 0) {
    alert('No data available to export');
    return false;
  }

  const filename = `Current_Reports_${timestamp}`;
  const success = exportToExcel(sheets, filename);
  
  if (success) {
    alert(`Successfully exported ${sheets.length} report(s) to ${filename}.xlsx`);
  } else {
    alert('Failed to export reports. Please try again.');
  }

  return success;
};

export const exportAllReports = async (allReports, allReportData) => {
  if (!allReports || allReports.length === 0) {
    alert('No reports available to export');
    return false;
  }

  const sheets = [];
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  // Create a summary sheet
  const summaryData = allReports.map(report => ({
    'Report Name': report.name,
    'Type': report.type,
    'Created': report.createdAt,
    'Last Updated': report.updatedAt,
    'Status': report.status || 'Active'
  }));

  sheets.push({
    data: summaryData,
    sheetName: 'Reports Summary'
  });

  // Add individual report sheets
  for (const report of allReports) {
    let formattedData = [];
    let sheetName = report.name;

    switch (report.type) {
      case 'pipeline':
        formattedData = formatSalesPipelineData(allReportData.pipelineData);
        sheetName = 'Sales Pipeline';
        break;
      case 'forecast':
        formattedData = formatRevenueForecastData(allReportData.forecastData);
        sheetName = 'Revenue Forecast';
        break;
      case 'customer':
        formattedData = formatCustomerAnalysisData(allReportData.customerData);
        sheetName = 'Customer Analysis';
        break;
      case 'performance':
        formattedData = formatPerformanceData(allReportData.performanceData);
        sheetName = 'Performance Analysis';
        break;
      default:
        formattedData = allReportData[report.type] || [];
    }

    if (formattedData.length > 0) {
      sheets.push({
        data: formattedData,
        sheetName: sheetName.substring(0, 31)
      });
    }
  }

  const filename = `All_Reports_${timestamp}`;
  const success = exportToExcel(sheets, filename);
  
  if (success) {
    alert(`Successfully exported all reports to ${filename}.xlsx`);
  } else {
    alert('Failed to export all reports. Please try again.');
  }

  return success;
};

// Individual report export functions
export const exportSingleReport = (reportType, data, reportName) => {
  let formattedData = [];
  
  switch (reportType) {
    case 'pipeline':
      formattedData = formatSalesPipelineData(data);
      break;
    case 'forecast':
      formattedData = formatRevenueForecastData(data);
      break;
    case 'customer':
      formattedData = formatCustomerAnalysisData(data);
      break;
    case 'performance':
      formattedData = formatPerformanceData(data);
      break;
    default:
      formattedData = Array.isArray(data) ? data : [];
  }

  if (formattedData.length === 0) {
    alert('No data available to export');
    return false;
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}`;
  
  return exportToCSV(formattedData, filename);
};

// Utility function to download JSON data (for debugging)
export const exportToJSON = (data, filename) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return false;
  }
};

export { exportToExcel, exportToCSV };