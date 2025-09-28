import React, { useState, useEffect } from "react";
import {
  CardContent,
  Typography,
  Box,
  Grid,
  Paper
} from "@mui/material";
import { getDashboardSummary } from "../../services/reportService"; // <-- import service

const MetricCard = ({ title, value, change, changeType, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "#28a745";
      case "negative":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  return (
    <Paper
      elevation={isHovered ? 8 : 3}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        borderRadius: 3,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start"
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#6c757d",
                fontSize: "0.875rem",
                fontWeight: 500,
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                mb: 1,
                color: "#2c3e50",
                fontSize: "2rem"
              }}
            >
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: getChangeColor()
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: getChangeColor(),
                    fontSize: "0.75rem",
                    fontWeight: 500
                  }}
                >
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: color + "20",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              transition: "all 0.3s ease",
              transform: isHovered ? "scale(1.1)" : "scale(1)"
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Paper>
  );
};

const MetricsGrid = () => {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const summary = await getDashboardSummary();

        // 🔥 map API response into cards
        const mappedMetrics = [
          {
            title: "Total Revenue",
            value: `$${summary.totalRevenue?.toLocaleString() || 0}`,
            change: summary.revenueChange || "+0%",
            changeType: summary.revenueChange?.includes("-")
              ? "negative"
              : "positive",
            icon: "💰",
            color: "#28a745"
          },
          {
            title: "Active Deals",
            value: summary.activeDeals || 0,
            change: summary.dealsChange || "+0%",
            changeType: summary.dealsChange?.includes("-")
              ? "negative"
              : "positive",
            icon: "🎯",
            color: "#17a2b8"
          },
          {
            title: "Conversion Rate",
            value: `${summary.conversionRate || 0}%`,
            change: summary.conversionChange || "0%",
            changeType: summary.conversionChange?.includes("-")
              ? "negative"
              : "positive",
            icon: "📈",
            color: "#ffc107"
          },
          {
            title: "Customer Count",
            value: summary.customerCount || 0,
            change: summary.customerChange || "+0%",
            changeType: summary.customerChange?.includes("-")
              ? "negative"
              : "positive",
            icon: "👥",
            color: "#fd7e14"
          }
        ];

        setMetrics(mappedMetrics);
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsGrid;
