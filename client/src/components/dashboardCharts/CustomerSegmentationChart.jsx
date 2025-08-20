import React from 'react';
import { Box } from '@mui/material';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  PieSeries
} from '@syncfusion/ej2-react-charts';

const CustomerSegmentChart = () => {
  const segmentData = [
    { segment: 'Enterprise', customers: 45, percentage: 28, revenue: 5625000 },
    { segment: 'Mid-Market', customers: 128, percentage: 35, revenue: 5760000 },
    { segment: 'Small Business', customers: 324, percentage: 32, revenue: 3888000 },
    { segment: 'Startup', customers: 89, percentage: 5, revenue: 756500 }
  ];

  const tooltip = {
    enable: true,
    format: '<b>${point.x}</b><br/>Revenue: <b>$${point.y}M</b><br/>Customers: <b>${point.text}</b>'
  };

  const dataLabel = {
    visible: true,
    name: 'x',
    position: 'Inside',
    font: { fontWeight: '600', color: 'white', size: '12px' }
  };

  const legend = {
    visible: true,
    position: 'Right'
  };

  const chartData = segmentData.map(item => ({
    x: item.segment,
    y: (item.revenue / 1000000).toFixed(1),
    text: item.customers.toString()
  }));

  const palette = [
    'hsl(217, 91%, 60%)',  // Primary Blue
    'hsl(142, 76%, 36%)',  // Success Green  
    'hsl(32, 95%, 44%)',   // Warning Orange
    'hsl(271, 81%, 56%)'   // Purple
  ];

  return (
    <div className="w-full h-80">
      <AccumulationChartComponent
        id="customer-segment-pie-chart"
        tooltip={tooltip}
        legendSettings={legend}
        width = "600px"
        height="100%"
        background="transparent"
        theme="Material"
      >
        <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
        <AccumulationSeriesCollectionDirective>
          <AccumulationSeriesDirective
            dataSource={chartData}
            xName="x"
            yName="y"
            type="Pie"
            name="Customer Segments"
            radius="70%"
            innerRadius="30%"
            dataLabel={dataLabel}
            palettes={palette}
            explode={true}
            explodeIndex={1}
            explodeOffset="8%"
            startAngle={0}
            endAngle={360}
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );
};

export default CustomerSegmentChart;