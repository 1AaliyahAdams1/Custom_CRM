import React from 'react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  DataLabel,
  ColumnSeries,
  BarSeries
} from '@syncfusion/ej2-react-charts';

const ActivitiesOutcomesChart = ({ data }) => {
  // Transform real data if available
  const getChartData = () => {
    if (data?.chartData?.labels && data?.chartData?.datasets) {
      const { labels, datasets } = data.chartData;
      
      return labels.map(label => {
        const result = { type: label };
        
        datasets.forEach(dataset => {
          const value = dataset.data[labels.indexOf(label)] || 0;
          result[dataset.label.toLowerCase().replace(/\s+/g, '_')] = value;
        });
        
        return result;
      });
    }
    
    // Fallback data
    return [
      { type: 'Calls', closed_won: 45, qualified: 32, proposal: 18, closed_lost: 12 },
      { type: 'Emails', closed_won: 89, qualified: 65, proposal: 42, closed_lost: 23 },
      { type: 'Meetings', closed_won: 34, qualified: 28, proposal: 15, closed_lost: 6 },
      { type: 'Demos', closed_won: 28, qualified: 22, proposal: 12, closed_lost: 8 }
    ];
  };

  const chartData = getChartData();

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Activity Type',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Count',
    lineStyle: { width: 0 },
    majorGridLines: { width: 1, color: '#e0e0e0' },
    majorTickLines: { width: 0 },
    minimum: 0
  };

  const tooltip = {
    enable: true,
    shared: true,
    format: '<b>{point.x}</b><br/>{series.name}: <b>{point.y}</b>' 
  };

  // Get all outcome keys dynamically from data
  const outcomeKeys = chartData.length > 0 ? 
    Object.keys(chartData[0]).filter(key => key !== 'type') : 
    ['closed_won', 'qualified', 'proposal', 'closed_lost'];

  const seriesColors = {
    'closed_won': 'hsl(142, 76%, 36%)',      // Green
    'qualified': 'hsl(217, 91%, 60%)',       // Blue  
    'proposal': 'hsl(32, 95%, 44%)',         // Orange
    'negotiation': 'hsl(271, 81%, 56%)',     // Purple
    'closed_lost': 'hsl(0, 84%, 60%)',       // Red
    'default': 'hsl(220, 13%, 69%)'          // Gray
  };

  return (
    <div className="w-full h-80">
      <ChartComponent
        id="activities-chart"
        primaryXAxis={primaryXAxis}
        primaryYAxis={primaryYAxis}
        tooltip={tooltip}
        width="600px"
        height="100%"
        background="transparent"
        theme="Material"
      >
        <Inject services={[ColumnSeries, BarSeries, Legend, Tooltip, DataLabel, Category]} />
        <SeriesCollectionDirective>
          {outcomeKeys.map((outcome, index) => (
            <SeriesDirective
              key={outcome}
              dataSource={chartData}
              xName="type"
              yName={outcome}
              type="Column"
              name={outcome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              fill={seriesColors[outcome] || seriesColors.default}
              columnWidth={0.6}
              cornerRadius={{ topLeft: 3, topRight: 3 }}
            />
          ))}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default ActivitiesOutcomesChart;