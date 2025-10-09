import React, { useEffect, useState } from "react";
import { Box, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getSalesPipelineReport,
  getRevenueForecastReport,
  getClosedDealsByPeriodReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
} from "../services/reportService";

import SalesPipelineChart from "../components/dashboardCharts/SalesPipelineChart";
import RevenueChart from "../components/dashboardCharts/RevenueForecastChart";
import ClosedDealsChart from "../components/dashboardCharts/ClosedDealsChart";
import CustomerSegmentChart from "../components/dashboardCharts/CustomerSegmentationChart";
import ActivitiesOutcomesChart from "../components/dashboardCharts/ActivitiesOutcomesChart";
import WelcomeBanner from "../components/WelcomeBanner";
import ChartCard from "../components/dashboardCharts/ChartCard";
import LoadingScreen from "../components/LoadingScreen";

const Dashboard = () => {
  const theme = useTheme();
  
  const [data, setData] = useState({
    salesPipeline: null,
    revenue: null,
    closedDeals: null,
    customers: null,
    activities: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [
          salesPipeline,
          revenue,
          closedDeals,
          customers,
          activities,
        ] = await Promise.all([
          getSalesPipelineReport(),
          getRevenueForecastReport(),
          getClosedDealsByPeriodReport(),
          getCustomerSegmentationReport(),
          getActivitiesVsOutcomesReport(),
        ]);

        setData({
          salesPipeline,
          revenue,
          closedDeals,
          customers,
          activities,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <LoadingScreen message="Loading dashboard data..." />;
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 3
      }}
    >
      {/* Welcome Banner */}
      <Box sx={{ gridColumn: 'span 12' }}>
        <WelcomeBanner />
      </Box>

      {/* Row 1 */}
      {data.salesPipeline && (
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
          <ChartCard title="Sales Pipeline">
            <SalesPipelineChart data={data.salesPipeline} />
          </ChartCard>
        </Box>
      )}
      {data.revenue && (
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
          <ChartCard title="Revenue Forecast">
            <RevenueChart data={data.revenue} />
          </ChartCard>
        </Box>
      )}

      {/* Row 2 */}
      {data.closedDeals && (
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
          <ChartCard title="Closed Deals">
            <ClosedDealsChart data={data.closedDeals} />
          </ChartCard>
        </Box>
      )}
      {data.customers && (
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
          <ChartCard title="Customer Segmentation">
            <CustomerSegmentChart data={data.customers} />
          </ChartCard>
        </Box>
      )}

      {/* Row 3 */}
      {data.activities && (
        <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
          <ChartCard title="Activities vs Outcomes">
            <ActivitiesOutcomesChart data={data.activities} />
          </ChartCard>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;