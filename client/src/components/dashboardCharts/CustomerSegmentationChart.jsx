import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  useTheme,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from "@mui/material";

const CustomerSegmentChart = ({ data }) => {
  const theme = useTheme();

  // Check if we have valid data
  if (!data) {
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
          <Alert severity="info">Loading segmentation data...</Alert>
        </CardContent>
      </Card>
    );
  }

  // Transform data from API response
  const getChartData = () => {
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((segment) => ({
        name: segment.segment || "Unknown",
        value: segment.customerCount || 0,
        text: `${segment.customerCount || 0} customers`,
        percentage:
          segment.formattedPercentage ||
          `${(segment.percentage || 0).toFixed(1)}%`,
      }));
    }

    return [];
  };

  const chartData = getChartData();

  // If no data after transformation, show empty state
  if (chartData.length === 0) {
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
          <Alert severity="info">
            No customer data available for segmentation.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Color palette
  const palette = [
    "hsl(217, 91%, 60%)", // Blue
    "hsl(142, 76%, 36%)", // Green
    "hsl(32, 95%, 44%)", // Orange
    "hsl(271, 81%, 56%)", // Purple
    "hsl(0, 84%, 60%)", // Red
    "hsl(291, 64%, 42%)", // Dark Purple
    "hsl(197, 71%, 52%)", // Cyan
    "hsl(45, 93%, 47%)", // Yellow
    "hsl(348, 83%, 47%)", // Rose
    "hsl(168, 76%, 36%)", // Teal
  ];

  // Custom tooltip content
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
            {item.text}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Share: {item.percentage}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom label for pie slices
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "12px", fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                }}
                iconSize={10}
              />
              <Pie
                data={chartData}
                cx="35%"
                cy="50%"
                innerRadius="50%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={renderCustomLabel}
                labelLine={false}
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

        {/* Summary Stats */}
        {data.summary && (
          <Box
            sx={{
              mt: 2,
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
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {data.summary.totalCustomers || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Customers
              </Typography>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {data.summary.segmentCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Segments
              </Typography>
            </Box>

            {data.summary.topSegment && (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {data.summary.topSegment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Top Segment
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerSegmentChart;
