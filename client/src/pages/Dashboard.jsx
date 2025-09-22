// import React, { useState, useEffect } from 'react';
// import { Box, Container, Grid, Paper, Typography, ThemeProvider, CircularProgress, Alert } from '@mui/material';
// import '@syncfusion/ej2-icons/styles/material.css';
// import theme from '../components/Theme'; 

// import SalesPipelineChart from '../components/dashboardCharts/SalesPipelineChart';
// import RevenueChart from '../components/dashboardCharts/RevenueForecastChart';
// import CustomerSegmentChart from '../components/dashboardCharts/CustomerSegmentationChart';
// import ActivitiesChart from '../components/dashboardCharts/ActivitiesOutcomesChart';
// import ClosedDealsChart from '../components/dashboardCharts/ClosedDealsChart';
// import WelcomeBanner from '../components/WelcomeBanner';
// import WIPBanner from '../components/WIPBanner';
// import EnhancedMetricsGrid from '../components/dashboardCharts/MetricsGrid';

// // Import the API services
// import { getDashboardSummary } from '../services/reportService';

// const Dashboard = () => {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch dashboard data on component mount
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         console.log('Fetching dashboard data...');
       
//         const data = await getDashboardSummary();
//         console.log('Dashboard data received:', data);
//         setDashboardData(data);
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   const ChartContainer = ({ title, icon, children, fullWidth = false }) => (
//     <Grid item xs={12} lg={fullWidth ? 12 : 6}>
//       <Paper
//         elevation={3}
//         sx={{
//           backgroundColor: theme.palette.background.paper,
//           border: '1px solid ' + theme.palette.divider,
//           borderRadius: 3,
//           overflow: 'hidden',
//           height: '100%',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             transform: 'translateY(-2px)',
//             boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
//           }
//         }}
//       >
//         <Box
//           sx={{
//             p: 3,
//             pb: 2,
//             borderBottom: '1px solid ' + theme.palette.divider,
//             backgroundColor: theme.palette.background.default
//           }}
//         >
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//             <Box
//               sx={{
//                 width: 36,
//                 height: 36,
//                 borderRadius: 2,
//                 backgroundColor: theme.palette.divider,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               <span className={`e-icons ${icon}`} style={{ color: theme.palette.text.primary, fontSize: '18px' }} />
//             </Box>
//             <Typography
//               variant="h6"
//               component="h3"
//               sx={{ fontWeight: 600, color: theme.palette.text.primary }}
//             >
//               {title}
//             </Typography>
//           </Box>
//         </Box>
//         <Box sx={{ p: 3, pt: 2 }}>
//           {children}
//         </Box>
//       </Paper>
//     </Grid>
//   );

//   if (loading) {
//     return (
//       <ThemeProvider theme={theme}>
//         <Box sx={{ 
//           minHeight: '100vh', 
//           backgroundColor: theme.palette.background.default, 
//           display: 'flex', 
//           alignItems: 'center', 
//           justifyContent: 'center' 
//         }}>
//           <Box sx={{ textAlign: 'center' }}>
//             <CircularProgress size={60} />
//             <Typography variant="h6" sx={{ mt: 2, color: theme.palette.text.primary }}>
//               Loading Dashboard...
//             </Typography>
//           </Box>
//         </Box>
//       </ThemeProvider>
//     );
//   }

//   if (error) {
//     return (
//       <ThemeProvider theme={theme}>
//         <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, p: 3 }}>
//           <Container maxWidth="xl">
//             <WIPBanner />
//             <WelcomeBanner />
//             <Alert severity="error" sx={{ mb: 3 }}>
//               {error}
//             </Alert>
//             <EnhancedMetricsGrid dashboardData={null} />
//             <Grid container spacing={3}>
//               <ChartContainer title="Sales Pipeline" icon="e-funnel-chart">
//                 <SalesPipelineChart data={null} />
//               </ChartContainer>
//               <ChartContainer title="Revenue Forecast" icon="e-line-chart">
//                 <RevenueChart data={null} />
//               </ChartContainer>
//               <ChartContainer title="Customer Segments" icon="e-people">
//                 <CustomerSegmentChart data={null} />
//               </ChartContainer>
//               <ChartContainer title="Activities Performance" icon="e-bar-chart">
//                 <ActivitiesChart data={null} />
//               </ChartContainer>
//               <ChartContainer title="Closed Deals Analysis" icon="e-target" fullWidth>
//                 <Box sx={{ mt: 1 }}>
//                   <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.875rem' }}>
//                     Deal value distribution and performance overview
//                   </Typography>
//                   <ClosedDealsChart data={null} />
//                 </Box>
//               </ChartContainer>
//             </Grid>
//           </Container>
//         </Box>
//       </ThemeProvider>
//     );
//   }

//   return (
//     <ThemeProvider theme={theme}>
//       <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, p: 3 }}>
//         <Container maxWidth="xl">
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             <WIPBanner />
//             <WelcomeBanner />
//             <EnhancedMetricsGrid dashboardData={dashboardData} />
//             <Grid container spacing={3}>
//               <ChartContainer title="Sales Pipeline" icon="e-funnel-chart">
//                 <SalesPipelineChart data={dashboardData?.salesPipeline} />
//               </ChartContainer>
//               <ChartContainer title="Revenue Forecast" icon="e-line-chart">
//                 <RevenueChart data={dashboardData?.revenue} />
//               </ChartContainer>
//               <ChartContainer title="Customer Segments" icon="e-people">
//                 <CustomerSegmentChart data={dashboardData?.customers} />
//               </ChartContainer>
//               <ChartContainer title="Activities Performance" icon="e-bar-chart">
//                 <ActivitiesChart data={dashboardData?.activities} />
//               </ChartContainer>
//               <ChartContainer title="Closed Deals Analysis" icon="e-target" fullWidth>
//                 <Box sx={{ mt: 1 }}>
//                   <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2, fontSize: '0.875rem' }}>
//                     Deal value distribution and performance overview
//                   </Typography>
//                   <ClosedDealsChart data={dashboardData?.closedDeals} />
//                 </Box>
//               </ChartContainer>
//             </Grid>
//             <Box sx={{ mt: 4, textAlign: 'center' }}>
//               <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}>
//                 Dashboard last updated: {dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleString() : new Date().toLocaleString()}
//               </Typography>
//             </Box>
//           </Box>
//         </Container>
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default Dashboard;