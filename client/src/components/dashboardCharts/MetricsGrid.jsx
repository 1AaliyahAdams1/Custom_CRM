// import React from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Grid,
//   useTheme
// } from '@mui/material';
// import { registerLicense } from '@syncfusion/ej2-base';
// // Import Syncfusion icons
// import '@syncfusion/ej2-icons/styles/material.css';

// const MetricCard = ({ title, value, change, changeType, icon }) => {
//   const theme = useTheme();

//   const getChangeColor = () => {
//     switch (changeType) {
//       case 'positive':
//         return theme.palette.success.main;
//       case 'negative':
//         return theme.palette.error.main;
//       default:
//         return theme.palette.text.secondary;
//     }
//   };

//   const getChangeIcon = () => {
//     if (changeType === 'positive') {
//       return <span className="e-icons e-chevron-up" style={{ fontSize: '12px' }} />;
//     } else if (changeType === 'negative') {
//       return <span className="e-icons e-chevron-down" style={{ fontSize: '12px' }} />;
//     }
//     return null;
//   };

//   return (
//     <Card
//       sx={{
//         background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
//         backdropFilter: 'blur(10px)',
//         border: `1px solid ${theme.palette.divider}`,
//         boxShadow: theme.shadows[2],
//         height: '100%'
//       }}
//     >
//       <Box sx={{ p: 2 }}>
//         {/* Header */}
//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             mb: 2
//           }}
//         >
//           <Typography
//             variant="body2"
//             sx={{
//               color: theme.palette.text.secondary,
//               fontWeight: 500,
//               fontSize: '0.875rem'
//             }}
//           >
//             {title}
//           </Typography>
//           <Box sx={{ color: theme.palette.primary.main }}>
//             {icon}
//           </Box>
//         </Box>

//         {/* Content */}
//         <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//           <Typography
//             variant="h4"
//             sx={{
//               fontWeight: 'bold',
//               mb: 1,
//               color: theme.palette.text.primary
//             }}
//           >
//             {value}
//           </Typography>
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               fontSize: '0.75rem',
//               color: getChangeColor()
//             }}
//           >
//             {getChangeIcon()}
//             <Typography
//               variant="caption"
//               sx={{
//                 ml: 0.5,
//                 color: getChangeColor(),
//                 fontSize: '0.75rem'
//               }}
//             >
//               {change} from last month
//             </Typography>
//           </Box>
//         </CardContent>
//       </Box>
//     </Card>
//   );
// };

// const MetricsGrid = () => {
//   const metrics = [
//     {
//       title: 'Total Revenue',
//       value: '$2.4M',
//       change: '+12.5%',
//       changeType: 'positive',
//       icon: <span className="e-icons e-money" style={{ fontSize: '16px' }} />
//     },
//     {
//       title: 'Active Deals',
//       value: '142',
//       change: '+8.2%',
//       changeType: 'positive',
//       icon: <span className="e-icons e-target" style={{ fontSize: '16px' }} />
//     },
//     {
//       title: 'Conversion Rate',
//       value: '24.8%',
//       change: '-2.1%',
//       changeType: 'negative',
//       icon: <span className="e-icons e-line-chart" style={{ fontSize: '16px' }} />
//     },
//     {
//       title: 'Customer Count',
//       value: '586',
//       change: '+15.3%',
//       changeType: 'positive',
//       icon: <span className="e-icons e-people" style={{ fontSize: '16px' }} />
//     }
//   ];

//   return (
//     <Grid container spacing={2}>
//       {metrics.map((metric, index) => (
//         <Grid item xs={12} sm={6} lg={3} key={index}>
//           <MetricCard {...metric} />
//         </Grid>
//       ))}
//     </Grid>
//   );
// };

// export default MetricsGrid;