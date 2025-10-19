import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Box, Card, CardContent, Typography, useTheme, Alert } from "@mui/material";

const SalesPipelineChart = ({ data }) => {
  const theme = useTheme();

  // Check if we have valid data
  if (!data) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3, height: "100%", backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Sales Pipeline
          </Typography>
          <Alert severity="info">Loading pipeline data...</Alert>
        </CardContent>
      </Card>
    );
  }

  // Transform data from API response
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((stage) => ({
        name: stage.stageName || "Unknown",
        deals: stage.dealCount || 0,
        value: stage.totalValue || 0,
        valueInK: ((stage.totalValue || 0) / 1000).toFixed(1), // Display value in thousands
      }));
    }

    return [];
  };

  const chartData = getChartData();

  // If no data after transformation, show empty state
  if (chartData.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3, height: "100%", backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
            Sales Pipeline
          </Typography>
          <Alert severity="info">No pipeline data available. Add deals to see your pipeline.</Alert>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deals: {item.deals}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Value: R{item.valueInK}K
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Calculate max value for Y axis
  const maxDeals = Math.max(...chartData.map(item => item.deals));
  const yAxisMax = Math.ceil(maxDeals * 1.2); // Add 20% padding

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        height: "100%",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
          Sales Pipeline
        </Typography>

        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="deals"
                name="Deals"
                fill="hsl(217, 91%, 60%)"
                radius={[8, 8, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value) => value,
                  fill: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        {data.summary && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data.summary.totalDeals || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Deals
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data.summary.formattedTotalValue || 'R0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pipeline Value
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                {data.summary.stageCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active Stages
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesPipelineChart;