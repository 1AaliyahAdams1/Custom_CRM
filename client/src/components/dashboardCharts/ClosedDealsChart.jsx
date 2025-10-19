import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Alert,
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

  // Check if we have valid data
  if (!data) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.divider}`,
          height: "100%",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2 }}>
          Closed Deals Revenue Trend
        </Typography>
        <Alert severity="info">Loading closed deals data...</Alert>
      </Paper>
    );
  }

  // Transform data from API response
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((period) => ({
        month: period.periodFormatted || period.period,
        revenue: Math.round((period.totalRevenue || 0) / 1000), // Convert to thousands
      }));
    }

    return [];
  };

  const chartData = getChartData();

  // If no data after transformation, show empty state
  if (chartData.length === 0) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.divider}`,
          height: "100%",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2 }}>
          Closed Deals Revenue Trend
        </Typography>
        <Alert severity="info">No closed deals yet. Close your first deal to see trends.</Alert>
      </Paper>
    );
  }

  // Custom tooltip formatter
  const formatTooltip = (value, name) => [`R${value}K`, "Revenue"];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            height: "100%",
          }}
        >
          {/* Title */}
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

          {/* Chart */}
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
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                    borderRadius: 4,
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
                    stroke: theme.palette.background.paper,
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

          {/* Summary Section */}
          {data.summary && (
            <Box
              sx={{
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: '1rem' }}
                >
                  {data.summary.formattedTotalRevenue || "R0"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Total Revenue
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: '1rem' }}
                >
                  {data.summary.formattedAverageMonthlyRevenue || "R0"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Average Monthly
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: '1rem' }}
                >
                  {data.summary.periodCount || 0}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  Periods
                </Typography>
              </Box>
              {data.summary.highestMonth && (
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.text.primary, fontWeight: "bold", fontSize: '1rem' }}
                  >
                    {data.summary.highestMonth.formattedTotalRevenue}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Best ({data.summary.highestMonth.periodFormatted})
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ClosedDealsChart;