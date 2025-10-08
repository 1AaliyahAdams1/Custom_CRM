import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme, Card, CardContent, Typography, Box } from "@mui/material";

const CustomerSegmentChart = ({ data }) => {
  const theme = useTheme();

  // --- Data transformation
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((segment) => ({
        name: segment.segment,
        value: segment.customerCount,
        text: `${segment.customerCount} customers`,
        percentage: segment.formattedPercentage,
      }));
    }

    // Fallback data
    return [
      { name: "Enterprise", value: 45, text: "45 customers", percentage: "28%" },
      { name: "Mid-Market", value: 128, text: "128 customers", percentage: "35%" },
      { name: "Small Business", value: 324, text: "324 customers", percentage: "32%" },
      { name: "Startup", value: 89, text: "89 customers", percentage: "5%" },
    ];
  };

  const chartData = getChartData();

  // --- Palette (consistent across charts)
  const palette = [
    "hsl(217, 91%, 60%)", // Blue
    "hsl(142, 76%, 36%)", // Green
    "hsl(32, 95%, 44%)",  // Orange
    "hsl(271, 81%, 56%)", // Purple
    "hsl(0, 84%, 60%)",   // Red
    "hsl(291, 64%, 42%)", // Dark Purple
  ];

  // --- Custom tooltip content
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
            Customers: {item.text}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share: {item.percentage}
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
        <Typography
          variant="h6"
          sx={{ mb: 2, color: theme.palette.text.primary }}
        >
          Customer Segments
        </Typography>

        <Box sx={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                wrapperStyle={{
                  paddingLeft: 10,
                  fontSize: 13,
                  color: theme.palette.text.secondary,
                }}
              />
              <Pie
                data={chartData}
                cx="40%"
                cy="50%"
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ percentage }) => percentage}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={palette[index % palette.length]}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentChart;
