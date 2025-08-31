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
  ColumnSeries
} from '@syncfusion/ej2-react-charts';

const SalesPipelineChart = ({ data }) => {
  // Default fallback data
  const defaultData = [
    { stage: 'Prospecting', deals: 45, value: 2250000 },
    { stage: 'Qualification', deals: 32, value: 1920000 },
    { stage: 'Proposal', deals: 18, value: 1440000 },
    { stage: 'Negotiation', deals: 12, value: 1320000 },
    { stage: 'Closing', deals: 8, value: 960000 }
  ];

  // Transform real data if available
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(stage => ({
        stage: stage.stageName || 'Unknown',
        deals: stage.dealCount || 0,
        value: stage.totalValue || 0
      }));
    }
    return defaultData;
  };

  const chartData = getChartData();

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Pipeline Stage',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Deal Count',
    labelFormat: '{value}',
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 }
  };

  const tooltip = {
    enable: true,
    format: '<b>${point.x}</b><br/>Deals: <b>${point.y}</b><br/>Value: <b>$${point.text}M</b>'
  };

  const transformedData = chartData.map(item => ({
    x: item.stage,
    y: item.deals,
    text: (item.value / 1000000).toFixed(1)
  }));

  return (
    <div className="w-full h-80">
      <ChartComponent
        id="pipeline-chart"
        primaryXAxis={primaryXAxis}
        primaryYAxis={primaryYAxis}
        tooltip={tooltip}
        width="600px" 
        height="100%"
        background="transparent"
        theme="Material"
      >
        <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            dataSource={transformedData}
            xName="x"
            yName="y"
            type="Column"
            name="Pipeline"
            fill="hsl(217, 91%, 60%)"
            columnWidth={0.7}
            cornerRadius={{ topLeft: 4, topRight: 4 }}
            dataLabel={{
              visible: true,
              position: 'Top',
              font: { fontWeight: '600', color: 'hsl(217, 91%, 60%)' }
            }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default SalesPipelineChart;