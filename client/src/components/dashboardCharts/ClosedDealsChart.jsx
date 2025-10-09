import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ClosedDealsChart = ({ data }) => {
  const theme = useTheme();

  // --- Default fallback data
  const defaultChartData = [
    { month: "Jan", revenue: 1250 },
    { month: "Feb", revenue: 1350 },
    { month: "Mar", revenue: 1450 },
    { month: "Apr", revenue: 1520 },
    { month: "May", revenue: 1680 },
  ];

  // --- Data transformation
  const getChartData = () => {
    if (data?.chartData?.labels && data?.chartData?.revenue) {
      return data.chartData.labels.map((label, index) => ({
        month: label,
        revenue: Math.round((data.chartData.revenue[index] || 0) / 1000), // Convert to thousands
      }));
    }
    return defaultChartData;
  };

  const chartData = getChartData();

  // --- Tooltip formatter
  const formatTooltip = (value, name) => [`R${value}K`, "Revenue"];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            height: "100%",
          }}
        >
          {/* --- Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
            }}
          >
            Closed Deals Revenue Trend
          </Typography>

          {/* --- Chart */}
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `R${v}K`}
                  tick={{ fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={formatTooltip}
                  contentStyle={{
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: "hsl(142, 76%, 36%)",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 2,
                    stroke: theme.palette.background.paper,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* --- Summary Section */}
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
              >
                {data?.formattedTotalRevenue || "R0"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Total Revenue
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
              >
                {data?.formattedAverageMonthly || "R0"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Average Monthly
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
              >
                {data?.periodCount || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Periods
              </Typography>
            </Box>
            {data?.highestMonth && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: "bold" }}
                >
                  {data.highestMonth.formattedTotalRevenue}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
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
