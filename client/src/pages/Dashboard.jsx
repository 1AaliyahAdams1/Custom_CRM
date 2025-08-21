import React from 'react';
import { Box, Container, Grid, Paper, Typography, ThemeProvider } from '@mui/material';
import '@syncfusion/ej2-icons/styles/material.css';
import theme from '../components/Theme'; 

import SalesPipelineChart from '../components/dashboardCharts/SalesPipelineChart';
import RevenueChart from '../components/dashboardCharts/RevenueForecastChart';
import CustomerSegmentChart from '../components/dashboardCharts/CustomerSegmentationChart';
import ActivitiesChart from '../components/dashboardCharts/ActivitiesOutcomesChart';
import ClosedDealsChart from '../components/dashboardCharts/ClosedDealsChart';
import WelcomeBanner from '../components/WelcomeBanner';
import WIPBanner from '../components/WIPBanner';
import EnhancedMetricsGrid from '../components/dashboardCharts/MetricsGrid';

const Dashboard = () => {
  const ChartContainer = ({ title, icon, children, fullWidth = false }) => (
    <Grid item xs={12} lg={fullWidth ? 12 : 6}>
      <Paper
        elevation={3}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: '1px solid ' + theme.palette.divider,
          borderRadius: 3,
          overflow: 'hidden',
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: '1px solid ' + theme.palette.divider,
            backgroundColor: theme.palette.background.default
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: theme.palette.divider,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className={`e-icons ${icon}`} style={{ color: theme.palette.text.primary, fontSize: '18px' }} />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: 3, pt: 2 }}>
          {children}
        </Box>
      </Paper>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, p: 3 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <WIPBanner />
            <WelcomeBanner />
            <EnhancedMetricsGrid />
            <Grid container spacing={3}>
              <ChartContainer title="Sales Pipeline" icon="e-funnel-chart">
                <SalesPipelineChart />
              </ChartContainer>
              <ChartContainer title="Revenue Forecast" icon="e-line-chart">
                <RevenueChart />
              </ChartContainer>
              <ChartContainer title="Customer Segments" icon="e-people">
                <CustomerSegmentChart />
              </ChartContainer>
              <ChartContainer title="Activities Performance" icon="e-bar-chart">
                <ActivitiesChart />
              </ChartContainer>
              <ChartContainer title="Closed Deals Analysis" icon="e-target" fullWidth>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.875rem' }}>
                    Deal value distribution and performance overview
                  </Typography>
                  <ClosedDealsChart />
                </Box>
              </ChartContainer>
            </Grid>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
                Dashboard last updated: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
