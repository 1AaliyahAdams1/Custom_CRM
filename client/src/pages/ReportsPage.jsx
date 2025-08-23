import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Download,
  Search as SearchIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

import ActivitiesOutcomeReport from '../components/reports/ActivitiesOutcomesReport';
import ClosedDealsReport from '../components/reports/ClosedDealsReport';
import CustomerSegmentationReport from '../components/reports/CustomerSegmentationReport';
import RevenueForecastReport from '../components/reports/RevenueForcastReport';
import SalesPipelineReport from '../components/reports/SalesPipeLineReport';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [exporting, setExporting] = useState(false);
  
  // Refs to access report data from child components
  const reportRefs = useRef({});

  // Define all available reports
  const allReports = [
    {
      id: "activities",
      title: "Activities Outcome",
      keywords: ["activities", "outcome", "calls", "emails", "meetings", "follow-up"]
    },
    {
      id: "closed-deals",
      title: "Closed Deals",
      keywords: ["closed", "deals", "won", "lost", "revenue", "sales"]
    },
    {
      id: "segmentation",
      title: "Customer Segmentation",
      keywords: ["customer", "segmentation", "segments", "enterprise", "demographics"]
    },
    {
      id: "forecast",
      title: "Revenue Forecast",
      keywords: ["revenue", "forecast", "prediction", "quarterly", "targets"]
    },
    {
      id: "pipeline",
      title: "Sales Pipeline",
      keywords: ["pipeline", "stages", "prospects", "opportunities", "conversion"]
    }
  ];

  // Filter reports based on search term
  const filteredReports = allReports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  // Reset active tab if current tab is not in filtered results
  React.useEffect(() => {
    if (activeTab >= filteredReports.length && filteredReports.length > 0) {
      setActiveTab(0);
    }
  }, [filteredReports, activeTab]);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Export utility functions
  const exportToExcel = (sheets, filename) => {
    try {
      const wb = XLSX.utils.book_new();
      
      sheets.forEach(sheet => {
        if (sheet.data && sheet.data.length > 0) {
          const ws = XLSX.utils.json_to_sheet(sheet.data);
          
          // Set column widths for better formatting
          const colWidths = Object.keys(sheet.data[0]).map(() => ({ wch: 20 }));
          ws['!cols'] = colWidths;
          
          XLSX.utils.book_append_sheet(wb, ws, sheet.sheetName);
        }
      });
      
      if (wb.SheetNames.length === 0) {
        throw new Error('No data to export');
      }
      
      XLSX.writeFile(wb, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return false;
    }
  };

  // Data transformation functions for each report type
  const transformActivitiesData = (reportData) => {
    if (!reportData) return [];
    
    const sheets = [];
    
    // Main activities data
    if (reportData.data && reportData.data.length > 0) {
      const mainData = reportData.data.map(item => ({
        'Activity Type': item.activityType,
        'Outcome': item.outcome,
        'Activity Count': item.activityCount
      }));
      sheets.push({ sheetName: 'Activities Breakdown', data: mainData });
    }
    
    // Conversion metrics
    if (reportData.conversionMetrics && reportData.conversionMetrics.length > 0) {
      const conversionData = reportData.conversionMetrics.map(item => ({
        'Activity Type': item.activityType,
        'Total Activities': item.totalActivities,
        'Positive Outcomes': item.positiveOutcomes,
        'Conversion Rate': item.formattedConversionRate || `${item.conversionRate?.toFixed(1)}%`
      }));
      sheets.push({ sheetName: 'Conversion Rates', data: conversionData });
    }
    
    // Summary
    if (reportData.summary) {
      const summaryData = [{
        'Total Activities': reportData.summary.totalActivities || 0,
        'Activity Type Count': reportData.summary.activityTypeCount || 0,
        'Top Activity Type': reportData.summary.topActivityType?.activityType || 'N/A',
        'Top Activity Count': reportData.summary.topActivityType?.totalActivities || 'N/A',
        'Best Conversion Activity': reportData.summary.bestConversionRate?.activityType || 'N/A',
        'Best Conversion Rate': reportData.summary.bestConversionRate?.formattedConversionRate || 'N/A'
      }];
      sheets.push({ sheetName: 'Summary', data: summaryData });
    }
    
    return sheets;
  };

  const transformClosedDealsData = (reportData) => {
    if (!reportData) return [];
    
    const sheets = [];
    
    // Main deals data
    if (reportData.data && reportData.data.length > 0) {
      const mainData = reportData.data.map(item => ({
        'Period': item.periodFormatted || item.period,
        'Period Raw': item.period,
        'Total Revenue': item.formattedTotalRevenue || `R ${item.totalRevenue?.toLocaleString() || 0}`
      }));
      sheets.push({ sheetName: 'Closed Deals by Period', data: mainData });
    }
    
    // Summary
    if (reportData.summary) {
      const summaryData = [{
        'Total Revenue': reportData.summary.formattedTotalRevenue || `R ${reportData.summary.totalRevenue?.toLocaleString() || 0}`,
        'Period Count': reportData.summary.periodCount || 0,
        'Average Monthly Revenue': reportData.summary.formattedAverageMonthlyRevenue || `R ${reportData.summary.averageMonthlyRevenue?.toLocaleString() || 0}`,
        'Highest Month': reportData.summary.highestMonth?.periodFormatted || 'N/A',
        'Highest Month Revenue': reportData.summary.highestMonth?.formattedTotalRevenue || 'N/A'
      }];
      sheets.push({ sheetName: 'Summary', data: summaryData });
    }
    
    return sheets;
  };

  const transformSegmentationData = (reportData) => {
    if (!reportData) return [];
    
    const sheets = [];
    
    // Main segmentation data
    if (reportData.data && reportData.data.length > 0) {
      const mainData = reportData.data.map(item => ({
        'Segment': item.segment,
        'Customer Count': item.customerCount,
        'Percentage': item.formattedPercentage || `${item.percentage?.toFixed(1)}%`
      }));
      sheets.push({ sheetName: 'Customer Segments', data: mainData });
    }
    
    // Summary
    if (reportData.summary) {
      const summaryData = [{
        'Total Customers': reportData.summary.totalCustomers || 0,
        'Segment Count': reportData.summary.segmentCount || 0,
        'Largest Segment': reportData.summary.largestSegment?.segment || 'N/A',
        'Largest Segment Count': reportData.summary.largestSegment?.customerCount || 'N/A',
        'Average Customers per Segment': reportData.summary.formattedAverageCustomersPerSegment || Math.round(reportData.summary.averageCustomersPerSegment || 0)
      }];
      sheets.push({ sheetName: 'Summary', data: summaryData });
    }
    
    return sheets;
  };

  const transformForecastData = (reportData) => {
    if (!reportData) return [];
    
    const sheets = [];
    
    // Main forecast data
    if (reportData.data && reportData.data.length > 0) {
      const mainData = reportData.data.map(item => ({
        'Period': item.periodFormatted || item.period,
        'Actual Revenue': item.formattedActualRevenue || (item.actualRevenue ? `R ${item.actualRevenue.toLocaleString()}` : 'N/A'),
        'Forecast Revenue': item.formattedForecastRevenue || (item.forecastRevenue ? `R ${item.forecastRevenue.toLocaleString()}` : 'N/A'),
        'Total Revenue': item.formattedTotalRevenue || (item.totalRevenue ? `R ${item.totalRevenue.toLocaleString()}` : 'N/A'),
        'Variance %': item.actualRevenue && item.forecastRevenue ? 
          `${(((item.actualRevenue - item.forecastRevenue) / item.forecastRevenue) * 100).toFixed(1)}%` : 'TBD'
      }));
      sheets.push({ sheetName: 'Revenue Forecast', data: mainData });
    }
    
    // Summary
    if (reportData.summary) {
      const summaryData = [{
        'Total Actual Revenue': reportData.summary.formattedTotalActualRevenue || `R ${reportData.summary.totalActualRevenue?.toLocaleString() || 0}`,
        'Total Forecast Revenue': reportData.summary.formattedTotalForecastRevenue || `R ${reportData.summary.totalForecastRevenue?.toLocaleString() || 0}`,
        'Average Monthly Actual': reportData.summary.formattedAverageMonthlyActual || `R ${reportData.summary.averageMonthlyActual?.toLocaleString() || 0}`,
        'Average Monthly Forecast': reportData.summary.formattedAverageMonthlyForecast || `R ${reportData.summary.averageMonthlyForecast?.toLocaleString() || 0}`
      }];
      sheets.push({ sheetName: 'Summary', data: summaryData });
    }
    
    return sheets;
  };

  const transformPipelineData = (reportData) => {
    if (!reportData) return [];
    
    const sheets = [];
    
    // Main pipeline data
    if (reportData.data && reportData.data.length > 0) {
      const mainData = reportData.data.map(item => ({
        'Stage': item.stageName || 'Unknown Stage',
        'Deal Count': item.dealCount || 0,
        'Total Value': item.formattedValue || `R ${item.totalValue?.toLocaleString() || 0}`,
        'Stage ID': item.stageId || 'N/A'
      }));
      sheets.push({ sheetName: 'Sales Pipeline', data: mainData });
    }
    
    // Summary
    if (reportData.summary) {
      const summaryData = [{
        'Total Deals': reportData.summary.totalDeals || 0,
        'Total Pipeline Value': reportData.summary.formattedTotalValue || `R ${reportData.summary.totalValue?.toLocaleString() || 0}`,
        'Active Stages': reportData.summary.stageCount || 0
      }];
      sheets.push({ sheetName: 'Summary', data: summaryData });
    }
    
    return sheets;
  };

  const handleExportCurrent = async () => {
    if (filteredReports.length === 0) return;
    
    setExporting(true);
    const currentReport = filteredReports[activeTab];
    let sheets = [];
    let reportName = "";

    try {
      // Get the actual data from the report component
      const reportRef = reportRefs.current[currentReport.id];
      if (!reportRef || !reportRef.getReportData) {
        throw new Error('Report data not available. Please wait for the report to load completely.');
      }

      const reportData = reportRef.getReportData();
      if (!reportData) {
        throw new Error('No data available to export. Please ensure the report has loaded.');
      }

      switch (currentReport.id) {
        case "activities":
          sheets = transformActivitiesData(reportData);
          reportName = "Activities_Outcome_Report";
          break;
        case "closed-deals":
          sheets = transformClosedDealsData(reportData);
          reportName = "Closed_Deals_Report";
          break;
        case "segmentation":
          sheets = transformSegmentationData(reportData);
          reportName = "Customer_Segmentation_Report";
          break;
        case "forecast":
          sheets = transformForecastData(reportData);
          reportName = "Revenue_Forecast_Report";
          break;
        case "pipeline":
          sheets = transformPipelineData(reportData);
          reportName = "Sales_Pipeline_Report";
          break;
        default:
          throw new Error('Unknown report type');
      }

      if (sheets.length === 0 || sheets.every(sheet => !sheet.data || sheet.data.length === 0)) {
        throw new Error('No data available to export');
      }

      const success = exportToExcel(sheets, reportName);
      if (success) {
        showToast(`${reportName.replace(/_/g, " ")} has been downloaded successfully.`, 'success');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast(error.message || "There was an error exporting the report. Please try again.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    setExporting(true);
    
    try {
      let allSheets = [];
      let hasData = false;

      // Collect data from all loaded reports
      for (const report of allReports) {
        const reportRef = reportRefs.current[report.id];
        if (reportRef && reportRef.getReportData) {
          const reportData = reportRef.getReportData();
          if (reportData) {
            let sheets = [];
            
            switch (report.id) {
              case "activities":
                sheets = transformActivitiesData(reportData);
                break;
              case "closed-deals":
                sheets = transformClosedDealsData(reportData);
                break;
              case "segmentation":
                sheets = transformSegmentationData(reportData);
                break;
              case "forecast":
                sheets = transformForecastData(reportData);
                break;
              case "pipeline":
                sheets = transformPipelineData(reportData);
                break;
            }
            
            // Add prefix to sheet names to avoid conflicts
            sheets.forEach(sheet => {
              sheet.sheetName = `${report.title} - ${sheet.sheetName}`;
              allSheets.push(sheet);
            });
            
            if (sheets.length > 0) hasData = true;
          }
        }
      }

      if (!hasData) {
        throw new Error('No report data available to export. Please ensure reports have loaded.');
      }

      const success = exportToExcel(allSheets, "Complete_CRM_Reports");
      if (success) {
        showToast("All available CRM reports have been downloaded successfully.", 'success');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast(error.message || "There was an error exporting the reports. Please try again.", 'error');
    } finally {
      setExporting(false);
    }
  };

  const getReportComponent = (reportId) => {
    const commonProps = {
      ref: (ref) => {
        if (ref) {
          reportRefs.current[reportId] = ref;
        }
      }
    };

    switch (reportId) {
      case "activities":
        return <ActivitiesOutcomeReport {...commonProps} />;
      case "closed-deals":
        return <ClosedDealsReport {...commonProps} />;
      case "segmentation":
        return <CustomerSegmentationReport {...commonProps} />;
      case "forecast":
        return <RevenueForecastReport {...commonProps} />;
      case "pipeline":
        return <SalesPipelineReport {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', p: 3 }}>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'start', sm: 'center' },
            gap: 2,
            mb: 4 
          }}
        >
          <Box>
            <Typography variant="h3" component="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive analytics and insights for your sales performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleExportCurrent}
              disabled={filteredReports.length === 0 || exporting}
              sx={{ 
                color: '#000',
                borderColor: '#000',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {exporting ? 'Exporting...' : 'Export Current'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={handleExportAll}
              disabled={exporting}
              sx={{ 
                backgroundColor: '#000',
                '&:hover': {
                  backgroundColor: '#333'
                }
              }}
            >
              {exporting ? 'Exporting...' : 'Export All Reports'}
            </Button>
          </Box>
        </Box>

        {/* Main Card */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Search Section */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f8f9fa' }}>
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <TextField
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ maxWidth: 400 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                {searchTerm && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
                  </Typography>
                )}
              </Box>
              
              {/* Tabs */}
              {filteredReports.length > 0 ? (
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-indicator': {
                      height: 3,
                      backgroundColor: '#000',
                    },
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      minHeight: 56,
                      px: 3,
                      color: '#666',
                      '&.Mui-selected': {
                        color: '#000',
                      }
                    }
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {filteredReports.map((report, index) => (
                    <Tab 
                      key={report.id}
                      label={report.title} 
                    />
                  ))}
                </Tabs>
              ) : searchTerm ? (
                <Box sx={{ height: 56, px: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No reports found matching "{searchTerm}"
                  </Typography>
                </Box>
              ) : null}
            </Box>

            {/* Content */}
            <Box sx={{ p: 3 }}>
              {filteredReports.length > 0 ? (
                <Box sx={{ width: '100%', overflow: 'hidden' }}>
                  {getReportComponent(filteredReports[activeTab]?.id)}
                </Box>
              ) : searchTerm ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No reports found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your search term or browse all available reports.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={() => setSearchTerm("")}
                    sx={{ 
                      color: '#000',
                      borderColor: '#000',
                      '&:hover': {
                        borderColor: '#333',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                </Box>
              ) : null}
            </Box>
          </CardContent>
        </Card>

        {/* Toast Notification */}
        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseToast} 
            severity={toast.severity}
            sx={{ width: '100%' }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ReportsPage;