import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { useTheme, Box, Typography, Card, CardContent } from "@mui/material";

const ActivitiesOutcomesChart = ({ data }) => {
  const theme = useTheme();

  // --- Data transformation (same logic as before)
  const getChartData = () => {
    if (data?.chartData?.labels && data?.chartData?.datasets) {
      const { labels, datasets } = data.chartData;

      return labels.map((label) => {
        const result = { type: label };
        datasets.forEach((dataset) => {
          const value = dataset.data[labels.indexOf(label)] || 0;
          result[
            dataset.label.toLowerCase().replace(/\s+/g, "_")
          ] = value;
        });
        return result;
      });
    }

    // Fallback data
    return [
      { type: "Calls", closed_won: 45, qualified: 32, proposal: 18, closed_lost: 12 },
      { type: "Emails", closed_won: 89, qualified: 65, proposal: 42, closed_lost: 23 },
      { type: "Meetings", closed_won: 34, qualified: 28, proposal: 15, closed_lost: 6 },
      { type: "Demos", closed_won: 28, qualified: 22, proposal: 12, closed_lost: 8 },
    ];
  };

  const chartData = getChartData();

  // --- Outcome keys
  const outcomeKeys =
    chartData.length > 0
      ? Object.keys(chartData[0]).filter((key) => key !== "type")
      : ["closed_won", "qualified", "proposal", "closed_lost"];

  // --- Series colors
  const seriesColors = {
    closed_won: "hsl(142, 76%, 36%)", // Green
    qualified: "hsl(217, 91%, 60%)",  // Blue
    proposal: "hsl(32, 95%, 44%)",    // Orange
    negotiation: "hsl(271, 81%, 56%)",// Purple
    closed_lost: "hsl(0, 84%, 60%)",  // Red
    default: "hsl(220, 13%, 69%)",    // Gray
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
        <Typography
          variant="h6"
          sx={{ mb: 2, color: theme.palette.text.primary }}
        >
          Activities Outcomes
        </Typography>

        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="type"
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                }}
                formatter={(value, name) => [value, name.replace(/_/g, " ")]}
              />
              <Legend />
              {outcomeKeys.map((outcome, index) => (
                <Bar
                  key={outcome}
                  dataKey={outcome}
                  name={outcome.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  fill={seriesColors[outcome] || seriesColors.default}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivitiesOutcomesChart;
