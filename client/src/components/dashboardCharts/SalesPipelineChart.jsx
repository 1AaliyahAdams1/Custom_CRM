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
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

const SalesPipelineChart = ({ data }) => {
  const theme = useTheme();

  // --- Transform data
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((stage) => ({
        stage: stage.stageName || "Unknown",
        deals: stage.dealCount || 0,
        value: stage.totalValue || 0,
      }));
    }

    // Fallback data
    return [
      { stage: "Prospecting", deals: 45, value: 2250000 },
      { stage: "Qualification", deals: 32, value: 1920000 },
      { stage: "Proposal", deals: 18, value: 1440000 },
      { stage: "Negotiation", deals: 12, value: 1320000 },
      { stage: "Closing", deals: 8, value: 960000 },
    ];
  };

  const chartData = getChartData().map((item) => ({
    name: item.stage,
    deals: item.deals,
    valueInM: (item.value / 1000000).toFixed(1), // Display value in millions
  }));

  // --- Custom tooltip
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
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deals: {item.deals}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Value: ${item.valueInM}M
          </Typography>
        </Box>
      );
    }
    return null;
  };

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
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="deals"
                name="Deals"
                fill="hsl(217, 91%, 60%)"
                radius={[4, 4, 0, 0]} // Rounded top corners
                label={{
                  position: "top",
                  formatter: (value) => value,
                  fill: "hsl(217, 91%, 60%)",
                  fontWeight: 600,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesPipelineChart;
