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
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  DataLabel,
  ColumnSeries,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel
} from '@syncfusion/ej2-react-charts';

const ClosedDealsChart = ({ deals = [] }) => {
  const theme = useTheme();

  // Default data if no deals provided
  const defaultDeals = [
    {
      id: 1,
      dealName: "Enterprise Software License",
      client: "Acme Corporation",
      value: 150000,
      closeDate: "2024-01-15",
      salesperson: "John Doe",
      stage: "won",
      probability: 100
    },
    {
      id: 2,
      dealName: "Marketing Automation Platform",
      client: "Tech Innovations",
      value: 75000,
      closeDate: "2024-01-10",
      salesperson: "Jane Smith",
      stage: "won",
      probability: 100
    },
    {
      id: 3,
      dealName: "Cloud Infrastructure Setup",
      client: "Global Solutions",
      value: 45000,
      closeDate: "2024-01-08",
      salesperson: "Mike Johnson",
      stage: "lost",
      probability: 0
    },
    {
      id: 4,
      dealName: "Custom Development Project",
      client: "Startup Ventures",
      value: 120000,
      closeDate: "2024-01-05",
      salesperson: "Sarah Wilson",
      stage: "won",
      probability: 100
    },
    {
      id: 5,
      dealName: "Data Analytics Solution",
      client: "Finance Corp",
      value: 95000,
      closeDate: "2024-01-03",
      salesperson: "David Chen",
      stage: "won",
      probability: 100
    }
  ];

  const dealsData = deals.length > 0 ? deals : defaultDeals;

  // Prepare data for Won vs Lost pie chart
  const wonDeals = dealsData.filter(d => d.stage === 'won');
  const lostDeals = dealsData.filter(d => d.stage === 'lost');
  const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const totalLostValue = lostDeals.reduce((sum, deal) => sum + deal.value, 0);

  const pieChartData = [
    { x: 'Won', y: totalWonValue, text: `$${(totalWonValue / 1000000).toFixed(1)}M` },
    { x: 'Lost', y: totalLostValue, text: `$${(totalLostValue / 1000000).toFixed(1)}M` }
  ];

  // Prepare data for deals by salesperson
  const salesPersonData = dealsData.reduce((acc, deal) => {
    if (!acc[deal.salesperson]) {
      acc[deal.salesperson] = { won: 0, lost: 0 };
    }
    if (deal.stage === 'won') {
      acc[deal.salesperson].won += deal.value;
    } else {
      acc[deal.salesperson].lost += deal.value;
    }
    return acc;
  }, {});

  const salesPersonChartData = Object.entries(salesPersonData).map(([name, values]) => ({
    salesperson: name.split(' ')[0], // Use first name for cleaner display
    won: values.won / 1000, // Convert to thousands
    lost: values.lost / 1000
  }));

  const primaryXAxis = {
    valueType: 'Category',
    title: 'Salesperson',
    majorGridLines: { width: 0 },
    lineStyle: { width: 0 },
    majorTickLines: { width: 0 }
  };

  const primaryYAxis = {
    title: 'Deal Value (K)',
    lineStyle: { width: 0 },
    majorGridLines: { width: 1, color: '#e0e0e0' },
    majorTickLines: { width: 0 },
    minimum: 0
  };

  const tooltip = {
    enable: true,
    shared: true,
    format: '<b>${point.x}</b><br/>${series.name}: <b>$${point.y}K</b>'
  };

  const pieTooltip = {
    enable: true,
    format: '<b>${point.x}</b><br/>Value: <b>${point.text}</b><br/>Percentage: <b>${point.percentage}%</b>'
  };

  return (
    <Grid container spacing={3}>
      {/* Won vs Lost Value Pie Chart */}
      <Grid item xs={12} lg={6}>
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
            Deal Value Distribution
          </Typography>
          <div className="w-full h-80">
            <AccumulationChartComponent
              id="deals-pie-chart"
              tooltip={pieTooltip}
              width ="600px"
              height="100%"
              background="transparent"
              theme="Material"
            >
              <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={pieChartData}
                  xName="x"
                  yName="y"
                  type="Pie"
                  name="Deal Value"
                  innerRadius="30%"
                  dataLabel={{
                    visible: true,
                    name: 'text',
                    position: 'Inside',
                    font: { fontWeight: '600', color: 'white', size: '12px' }
                  }}
                  palettes={['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)']}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>
        </Paper>
      </Grid>

      {/* Deals by Salesperson Column Chart
      <Grid item xs={12} lg={6}>
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
            Performance by Salesperson
          </Typography>
          <Box sx={{ width: '100%', height: 320 }}>
            <ChartComponent
              id="salesperson-chart"
              primaryXAxis={primaryXAxis}
              primaryYAxis={primaryYAxis}
              tooltip={tooltip}
              height="100%"
              background="transparent"
              theme="Material"
            >
              <Inject services={[ColumnSeries, Legend, Tooltip, DataLabel, Category]} />
              <SeriesCollectionDirective>
                <SeriesDirective
                  dataSource={salesPersonChartData}
                  xName="salesperson"
                  yName="won"
                  type="Column"
                  name="Won"
                  fill="hsl(142, 76%, 36%)"
                  columnWidth={0.6}
                  cornerRadius={{ topLeft: 3, topRight: 3 }}
                />
                <SeriesDirective
                  dataSource={salesPersonChartData}
                  xName="salesperson"
                  yName="lost"
                  type="Column"
                  name="Lost"
                  fill="hsl(0, 84%, 60%)"
                  columnWidth={0.6}
                  cornerRadius={{ topLeft: 3, topRight: 3 }}
                />
              </SeriesCollectionDirective>
            </ChartComponent>
          </Box>
        </Paper>
      </Grid> */}
    </Grid>
  );
};

export default ClosedDealsChart;