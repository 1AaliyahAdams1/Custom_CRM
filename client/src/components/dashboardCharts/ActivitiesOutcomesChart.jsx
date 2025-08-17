// import React from 'react';
// import { Box } from '@mui/material';
// import {
//   ChartComponent,
//   SeriesCollectionDirective,
//   SeriesDirective,
//   Inject,
//   Legend,
//   Category,
//   Tooltip,
//   DataLabel,
//   ColumnSeries,
//   BarSeries
// } from '@syncfusion/ej2-react-charts';

// const ActivitiesOutcomesChart = () => {
//   const activitiesData = [
//     { type: 'Calls', success: 45, failed: 12, pending: 8 },
//     { type: 'Emails', success: 89, failed: 23, pending: 15 },
//     { type: 'Meetings', success: 34, failed: 6, pending: 4 },
//     { type: 'Demos', success: 28, failed: 8, pending: 3 }
//   ];

//   const primaryXAxis = {
//     valueType: 'Category',
//     title: 'Activity Type',
//     majorGridLines: { width: 0 },
//     lineStyle: { width: 0 },
//     majorTickLines: { width: 0 }
//   };

//   const primaryYAxis = {
//     title: 'Count',
//     lineStyle: { width: 0 },
//     majorGridLines: { width: 1, color: '#e0e0e0' },
//     majorTickLines: { width: 0 },
//     minimum: 0,
//     interval: 20
//   };

//   const tooltip = {
//     enable: true,
//     shared: true,
//     format: '<b>${point.x}</b><br/>${series.name}: <b>${point.y}</b>'
//   };

//   return (
//     <div className="w-full h-80">
//       <ChartComponent
//         id="activities-chart"
//         primaryXAxis={primaryXAxis}
//         primaryYAxis={primaryYAxis}
//         tooltip={tooltip}
//         width = "600px"
//         height="100%"
//         background="transparent"
//         theme="Material"
//       >
//         <Inject services={[ColumnSeries, BarSeries, Legend, Tooltip, DataLabel, Category]} />
//         <SeriesCollectionDirective>
//           <SeriesDirective
//             dataSource={activitiesData}
//             xName="type"
//             yName="success"
//             type="Column"
//             name="Success"
//             fill="hsl(142, 76%, 36%)"
//             columnWidth={0.6}
//             cornerRadius={{ topLeft: 3, topRight: 3 }}
//           />
//           <SeriesDirective
//             dataSource={activitiesData}
//             xName="type"
//             yName="pending"
//             type="Column"
//             name="Pending"
//             fill="hsl(32, 95%, 44%)"
//             columnWidth={0.6}
//             cornerRadius={{ topLeft: 3, topRight: 3 }}
//           />
//           <SeriesDirective
//             dataSource={activitiesData}
//             xName="type"
//             yName="failed"
//             type="Column"
//             name="Failed"
//             fill="hsl(0, 84%, 60%)"
//             columnWidth={0.6}
//             cornerRadius={{ topLeft: 3, topRight: 3 }}
//           />
//         </SeriesCollectionDirective>
//       </ChartComponent>
//     </div>
//   );
// };

// export default ActivitiesOutcomesChart;