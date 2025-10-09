import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";

const RevenueChart = ({ data }) => {
  const theme = useTheme();

  // --- Transform data
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((period) => ({
        month: period.periodFormatted,
        predicted: period.forecastRevenue / 1000, // Convert to thousands
        actual: period.actualRevenue !== null ? period.actualRevenue / 1000 : null,
      }));
    }

    // Fallback data
    return [
      { month: "Jan", predicted: 1250, actual: 1180 },
      { month: "Feb", predicted: 1350, actual: 1420 },
      { month: "Mar", predicted: 1450, actual: 1380 },
      { month: "Apr", predicted: 1520, actual: 1580 },
      { month: "May", predicted: 1680, actual: 1620 },
      { month: "Jun", predicted: 1750, actual: null },
    ];
  };

  const chartData = getChartData();

  // --- Tooltip formatter
  const formatTooltip = (value, name) => [`R${value}K`, name];

  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: "100%", backgroundColor: theme.palette.background.paper }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
          Revenue Trend
        </Typography>

        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="month" tick={{ fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `R${v}K`} tick={{ fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
              <Tooltip formatter={formatTooltip} />
              <Legend verticalAlign="top" />
              
              {/* Actual Revenue */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Revenue"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={3}
                dot={{ r: 5, fill: "hsl(142, 76%, 36%)" }}
                activeDot={{ r: 7, strokeWidth: 2, stroke: theme.palette.background.paper }}
              />

              {/* Forecast Revenue */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="Forecast Revenue"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: theme.palette.background.paper }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
