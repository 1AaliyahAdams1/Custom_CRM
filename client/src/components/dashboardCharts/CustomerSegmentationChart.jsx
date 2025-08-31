import React from 'react';
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

const CustomerSegmentChart = ({ data }) => {
  // Transform real data if available, otherwise use fallback
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(segment => ({
        x: segment.segment,
        y: segment.customerCount,
        text: `${segment.customerCount} customers`,
        percentage: segment.formattedPercentage
      }));
    }
    
    // Fallback data
    return [
      { x: 'Enterprise', y: 45, text: '45 customers', percentage: '28%' },
      { x: 'Mid-Market', y: 128, text: '128 customers', percentage: '35%' },
      { x: 'Small Business', y: 324, text: '324 customers', percentage: '32%' },
      { x: 'Startup', y: 89, text: '89 customers', percentage: '5%' }
    ];
  };

  const chartData = getChartData();

  const tooltip = {
    enable: true,
    format: '<b>{point.x}</b><br/>Revenue: <b>$${point.y}M</b><br/>Customers: <b>{point.text}</b>' 
  };

  const dataLabel = {
    visible: true,
    name: 'percentage',
    position: 'Inside',
    font: { fontWeight: '600', color: 'white', size: '12px' }
  };

  const legend = {
    visible: true,
    position: 'Right'
  };

  const palette = [
    'hsl(217, 91%, 60%)',  // Primary Blue
    'hsl(142, 76%, 36%)',  // Success Green  
    'hsl(32, 95%, 44%)',   // Warning Orange
    'hsl(271, 81%, 56%)',  // Purple
    'hsl(0, 84%, 60%)',    // Error Red
    'hsl(291, 64%, 42%)'   // Dark Purple
  ];

  return (
    <div className="w-full h-80">
      <AccumulationChartComponent
        id="customer-segment-pie-chart"
        tooltip={tooltip}
        legendSettings={legend}
        width="600px"
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
            explodeIndex={0}
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
