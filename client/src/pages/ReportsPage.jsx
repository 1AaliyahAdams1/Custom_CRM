import React, { useState } from 'react';
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
  const [filteredReports, setFilteredReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [reportData, setReportData] = useState({});
  const [exporting, setExporting] = useState(false);

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

  // Data preparation functions - replace with actual data logic
  const prepareActivitiesData = () => {
    return [
      { Activity: 'Calls', Count: 150, Outcome: 'Positive' },
      { Activity: 'Emails', Count: 300, Outcome: 'Mixed' },
      { Activity: 'Meetings', Count: 75, Outcome: 'Positive' }
    ];
  };

  const prepareClosedDealsData = () => {
    return [
      { Deal: 'Enterprise CRM', Value: 250000, Status: 'Won', Date: '2024-01-15' },
      { Deal: 'Marketing Suite', Value: 180000, Status: 'Won', Date: '2024-01-20' },
      { Deal: 'Analytics Platform', Value: 150000, Status: 'Lost', Date: '2024-01-25' }
    ];
  };

  const prepareSegmentationData = () => {
    return [
      { Segment: 'Enterprise', Count: 45, Revenue: 2250000 },
      { Segment: 'Mid-Market', Count: 120, Revenue: 1800000 },
      { Segment: 'Small Business', Count: 300, Revenue: 900000 }
    ];
  };

  const prepareForecastData = () => {
    return [
      { Quarter: 'Q1 2024', Forecast: 3500000, Actual: 3200000 },
      { Quarter: 'Q2 2024', Forecast: 4000000, Actual: 3800000 },
      { Quarter: 'Q3 2024', Forecast: 4200000, Actual: null }
    ];
  };

  const preparePipelineData = () => {
    return [
      { Stage: 'Prospecting', Deals: 45, Value: 2250000 },
      { Stage: 'Qualification', Deals: 32, Value: 1920000 },
      { Stage: 'Proposal', Deals: 18, Value: 1440000 },
      { Stage: 'Negotiation', Deals: 12, Value: 1320000 },
      { Stage: 'Closing', Deals: 8, Value: 960000 }
    ];
  };

  const Reports = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

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

    const getReportComponent = (reportId) => {
      switch (reportId) {
        case "activities":
          return <ActivitiesOutcomeReport />;
        case "closed-deals":
          return <ClosedDealsReport />;
        case "segmentation":
          return <CustomerSegmentationReport />;
        case "forecast":
          return <RevenueForecastReport />;
        case "pipeline":
          return <SalesPipelineReport />;
        default:
          return null;
      }
    };

    const handleExportCurrent = async () => {
      if (filteredReports.length === 0) return;
      
      setExporting(true);
      const currentReport = filteredReports[activeTab];
      let sheets = [];
      let reportName = "";

      try {
        switch (currentReport.id) {
          case "activities":
            sheets = [{ sheetName: "Activities Outcome", data: prepareActivitiesData() }];
            reportName = "Activities_Outcome_Report";
            break;
          case "closed-deals":
            sheets = [{ sheetName: "Closed Deals", data: prepareClosedDealsData() }];
            reportName = "Closed_Deals_Report";
            break;
          case "segmentation":
            sheets = [{ sheetName: "Customer Segmentation", data: prepareSegmentationData() }];
            reportName = "Customer_Segmentation_Report";
            break;
          case "forecast":
            sheets = [{ sheetName: "Revenue Forecast", data: prepareForecastData() }];
            reportName = "Revenue_Forecast_Report";
            break;
          case "pipeline":
            sheets = [{ sheetName: "Sales Pipeline", data: preparePipelineData() }];
            reportName = "Sales_Pipeline_Report";
            break;
          default:
            throw new Error('Unknown report type');
        }

        const success = exportToExcel(sheets, reportName);
        if (success) {
          showToast(`${reportName.replace(/_/g, " ")} has been downloaded successfully.`, 'success');
        } else {
          throw new Error('Export failed');
        }
      } catch (error) {
        console.error('Export error:', error);
        showToast("There was an error exporting the report. Please try again.", 'error');
      } finally {
        setExporting(false);
      }
    };

    const handleExportAll = async () => {
      setExporting(true);
      
      try {
        const allSheets = [
          { sheetName: "Activities Outcome", data: prepareActivitiesData() },
          { sheetName: "Closed Deals", data: prepareClosedDealsData() },
          { sheetName: "Customer Segmentation", data: prepareSegmentationData() },
          { sheetName: "Revenue Forecast", data: prepareForecastData() },
          { sheetName: "Sales Pipeline", data: preparePipelineData() }
        ];

        const success = exportToExcel(allSheets, "Complete_CRM_Reports");
        if (success) {
          showToast("All CRM reports have been downloaded successfully.", 'success');
        } else {
          throw new Error('Export failed');
        }
      } catch (error) {
        console.error('Export error:', error);
        showToast("There was an error exporting the reports. Please try again.", 'error');
      } finally {
        setExporting(false);
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

  return <Reports />;
};

export default ReportsPage;