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
  LineSeries,
  AreaSeries,
  SplineSeries
} from '@syncfusion/ej2-react-charts';

const RevenueChart = ({ data }) => {
  // Transform real data if available
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(period => ({
        month: period.periodFormatted,
        predicted: period.forecastRevenue / 1000, // Convert to thousands
        actual: period.actualRevenue / 1000       // Convert to thousands
      }));
    }
    
    // Fallback data
    return [
      { month: 'Jan', predicted: 1250, actual: 1180 },
      { month: 'Feb', predicted: 1350, actual: 1420 },
      { month: 'Mar', predicted: 1450, actual: 1380 },
      { month: 'Apr', predicted: 1520, actual: 1580 },
      { month: 'May', predicted: 1680, actual: 1620 },
      { month: 'Jun', predicted: 1750, actual: null }
    ];
  };

  const chartData = getChartData();

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Month',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Revenue (Thousands ZAR)',
    labelFormat: 'R{value}K',
    lineStyle: { width: 0 },
    majorGridLines: { width: 1, color: '#e0e0e0' },
    majorTickLines: { width: 0 },
    minimum: 0
  };

  const tooltip = {
    enable: true,
    shared: true,
    format: '<b>{point.x}</b><br/>{series.name}: <b>R{point.y}K</b>'
  };

  const actualData = chartData.filter(item => item.actual !== null && item.actual !== undefined);
  const predictedData = chartData;

  return (
    <div className="w-full h-80">
      <ChartComponent
        id="revenue-chart"
        primaryXAxis={primaryXAxis}
        primaryYAxis={primaryYAxis}
        tooltip={tooltip}
        width="600px"
        height="100%"
        background="transparent"
        theme="Material"
      >
        <Inject services={[SplineSeries, LineSeries, AreaSeries, Legend, Tooltip, DataLabel, Category]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={actualData}
            xName="month"
            yName="actual"
            type="Spline"
            name="Actual Revenue"
            width={3}
            marker={{
              visible: true,
              width: 8,
              height: 8,
              fill: 'hsl(142, 76%, 36%)'
            }}
            fill="hsl(142, 76%, 36%)"
          />
          <SeriesDirective
            dataSource={predictedData}
            xName="month"
            yName="predicted"
            type="Spline"
            name="Forecast Revenue"
            width={2}
            dashArray="5,5"
            marker={{
              visible: true,
              width: 6,
              height: 6,
              fill: 'hsl(217, 91%, 60%)'
            }}
            fill="hsl(217, 91%, 60%)"
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default RevenueChart;
