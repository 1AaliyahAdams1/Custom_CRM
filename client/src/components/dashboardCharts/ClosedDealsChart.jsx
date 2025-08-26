import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
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
  SplineSeries
} from '@syncfusion/ej2-react-charts';

const ClosedDealsChart = ({ data }) => {
  const theme = useTheme();

  // Default data if no real data provided
  const defaultChartData = [
    { month: 'Jan', revenue: 1250 },
    { month: 'Feb', revenue: 1350 },
    { month: 'Mar', revenue: 1450 },
    { month: 'Apr', revenue: 1520 },
    { month: 'May', revenue: 1680 }
  ];

  // Transform real data if available
  const getChartData = () => {
    if (data?.chartData?.labels && data?.chartData?.revenue) {
      return data.chartData.labels.map((label, index) => ({
        month: label,
        revenue: Math.round((data.chartData.revenue[index] || 0) / 1000) // Convert to thousands
      }));
    }
    
    return defaultChartData;
  };

  const chartData = getChartData();

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Period',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Revenue (Thousands)',
    labelFormat: 'R{value}K',
    lineStyle: { width: 0 },
    majorGridLines: { width: 1, color: '#e0e0e0' },
    majorTickLines: { width: 0 },
    minimum: 0
  };

  const tooltip = {
    enable: true,
    format: '<b>{point.x}</b><br/>Revenue: <b>R{point.y}K</b>'
  };

  return (
    <Grid container spacing={3}>
      {/* Closed Deals Trend Chart */}
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            height: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2
            }}
          >
            Closed Deals Revenue Trend
          </Typography>
          <Box sx={{ width: '100%', height: 320 }}>
            <ChartComponent
              id="closed-deals-trend-chart"
              primaryXAxis={primaryXAxis}
              primaryYAxis={primaryYAxis}
              tooltip={tooltip}
              height="100%"
              background="transparent"
              theme="Material"
            >
              <Inject services={[SplineSeries, LineSeries, Legend, Tooltip, DataLabel, Category]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={chartData}
                  xName="month"
                  yName="revenue"
                  type="Spline"
                  name="Revenue"
                  width={3}
                  marker={{
                    visible: true,
                    width: 8,
                    height: 8,
                    fill: 'hsl(142, 76%, 36%)'
                  }}
                  fill="hsl(142, 76%, 36%)"
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </Box>
          
          {/* Summary Statistics */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data?.formattedTotalRevenue || 'R0'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Revenue
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data?.formattedAverageMonthly || 'R0'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Average Monthly
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data?.periodCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Periods
              </Typography>
            </Box>
            {data?.highestMonth && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                  {data.highestMonth.formattedTotalRevenue}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Best Month ({data.highestMonth.periodFormatted})
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ClosedDealsChart;