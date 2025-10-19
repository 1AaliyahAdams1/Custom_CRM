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

  // --- Data transformation
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

    // --- Fallback data
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
    closed_won: "hsl(145, 63%, 40%)",   // Green
    qualified: "hsl(210, 83%, 55%)",    // Blue
    proposal: "hsl(36, 92%, 50%)",      // Orange
    negotiation: "hsl(260, 70%, 55%)",  // Purple
    closed_lost: "hsl(355, 70%, 55%)",  // Red
    no_outcome: "hsl(220, 10%, 60%)",
    lead: "hsl(190, 60%, 45%)",
    contract: "hsl(125, 45%, 42%)",
    needs_analysis: "hsl(30, 70%, 48%)",
    default: "hsl(220, 13%, 69%)",
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
      <CardContent sx={{ pb: 1 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: theme.palette.text.primary }}
        >
          Activities Outcomes
        </Typography>

        {/* Chart container */}
        <Box
          sx={{
            width: "100%",
            height: 380,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ResponsiveContainer width="95%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 80, left: 10, bottom: 30 }}
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

              {/* Move legend to the right */}
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  paddingLeft: "10px",
                  fontSize: "0.9rem",
                }}
              />

              {outcomeKeys.map((outcome) => (
                <Bar
                  key={outcome}
                  dataKey={outcome}
                  name={outcome
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                  fill={seriesColors[outcome] || seriesColors.default}
                  radius={[6, 6, 0, 0]}
                  barSize={35}
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
