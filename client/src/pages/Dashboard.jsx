import React from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Chip,
//   Box,
//   Container,
//   Grid,
//   Paper
// } from '@mui/material';
// import '@syncfusion/ej2-icons/styles/material.css';

// // Import dashboard components
// import SalesPipelineChart from '../components/dashboardCharts/SalesPipelineChart';
// import RevenueChart from '../components/dashboardCharts/RevenueForecastChart';
// import CustomerSegmentChart from '../components/dashboardCharts/CustomerSegmentationChart';
// import ActivitiesChart from '../components/dashboardCharts/ActivitiesOutcomesChart';
// import ClosedDealsChart from '../components/dashboardCharts/ClosedDealsChart';
// import MetricsGrid from '../components/dashboardCharts/MetricsGrid';

// const Dashboard = () => {
//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         background: 'rgba(250, 250, 250, 1)',
//         padding: 3
//       }}
//     >
//       <Container maxWidth="xl">
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//           {/* Header */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <Box>
//               <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'black', mb: 1 }}>
//                 CRM Dashboard
//               </Typography>
//               <Typography variant="body1" sx={{ color: 'black' }}>
//                 Comprehensive view of your sales performance and pipeline
//               </Typography>
//             </Box>
//             <Chip
//               label={`Last updated: ${new Date().toLocaleDateString()}`}
//               variant="outlined"
//               sx={{
//                 color: 'black',
//                 borderColor: 'black',
//                 backgroundColor: 'rgba(255, 255, 255, 0.1)'
//               }}
//             />
//           </Box>

//           {/* Key Metrics Grid */}
//           <Box sx={{ mb: 4 }}>
//             <MetricsGrid />
//           </Box>

//           {/* Charts Grid */}
//           <Grid container spacing={3}>
//             {/* Sales Pipeline */}
//             <Grid item xs={12} lg={6}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: 2,
//                   overflow: 'hidden',
//                   height: '100%'
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <span className="e-icons e-funnel-chart" style={{ color: '#1976d2', fontSize: '20px' }} />
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       Sales Pipeline
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <CardContent sx={{ pt: 2 }}>
//                   <SalesPipelineChart />
//                 </CardContent>
//               </Paper>
//             </Grid>

//             {/* Revenue Trends */}
//             <Grid item xs={12} lg={6}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: 2,
//                   overflow: 'hidden',
//                   height: '100%'
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <span className="e-icons e-line-chart" style={{ color: '#2e7d32', fontSize: '20px' }} />
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       Revenue Trends
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <CardContent sx={{ pt: 2 }}>
//                   <RevenueChart />
//                 </CardContent>
//               </Paper>
//             </Grid>

//             {/* Customer Segments */}
//             <Grid item xs={12} lg={6}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: 2,
//                   overflow: 'hidden',
//                   height: '100%'
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <span className="e-icons e-people" style={{ color: '#ed6c02', fontSize: '20px' }} />
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       Customer Segments
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <CardContent sx={{ pt: 2 }}>
//                   <CustomerSegmentChart />
//                 </CardContent>
//               </Paper>
//             </Grid>

//             Activities Performance
//             <Grid item xs={12} lg={6}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: 2,
//                   overflow: 'hidden',
//                   height: '100%'
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <span className="e-icons e-bar-chart" style={{ color: '#9c27b0', fontSize: '20px' }} />
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       Activities Performance
//                     </Typography>
//                   </Box>
//                 </Box>
//                 <CardContent sx={{ pt: 2 }}>
//                   <ActivitiesChart />
//                 </CardContent>
//               </Paper>
//             </Grid>

//             {/* Closed Deals Analysis - Full Width */}
//             <Grid item xs={12}>
//               <Paper
//                 elevation={3}
//                 sx={{
//                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
//                   backdropFilter: 'blur(10px)',
//                   borderRadius: 2,
//                   overflow: 'hidden'
//                 }}
//               >
//                 <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <span className="e-icons e-target" style={{ color: '#1976d2', fontSize: '20px' }} />
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       Closed Deals Analysis
//                     </Typography>
//                   </Box>
//                   <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', mt: 0.5 }}>
//                     Deal value distribution and salesperson performance overview
//                   </Typography>
//                 </Box>
//                 <CardContent sx={{ pt: 2 }}>
//                   <ClosedDealsChart />
//                 </CardContent>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Dashboard;