import React from 'react';
import { Box } from '@mui/material';
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

const RevenueChart = () => {
  const revenueData = [
    { month: 'Jan', predicted: 1250000, actual: 1180000 },
    { month: 'Feb', predicted: 1350000, actual: 1420000 },
    { month: 'Mar', predicted: 1450000, actual: 1380000 },
    { month: 'Apr', predicted: 1520000, actual: 1580000 },
    { month: 'May', predicted: 1680000, actual: 1620000 },
    { month: 'Jun', predicted: 1750000, actual: null }
  ];

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Month',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Revenue (USD)',
    labelFormat: '${value}',
    lineStyle: { width: 0 },
    majorGridLines: { width: 1, color: '#e0e0e0' },
    majorTickLines: { width: 0 },
    minimum: 1000000,
    maximum: 2000000,
    interval: 200000
  };

  const tooltip = {
    enable: true,
    shared: true,
    format: '<b>${point.x}</b><br/>${series.name}: <b>${point.y}</b>'
  };

  const actualData = revenueData.filter(item => item.actual !== null);
  const predictedData = revenueData;

  return (
    <div className="w-full h-80">
      <ChartComponent
        id="revenue-chart"
        primaryXAxis={primaryXAxis}
        primaryYAxis={primaryYAxis}
        tooltip={tooltip}
        width ="600px"
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
            name="Predicted Revenue"
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