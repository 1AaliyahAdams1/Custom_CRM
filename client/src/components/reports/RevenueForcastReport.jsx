import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getRevenueForecastReport } from '../../services/reportService';

const RevenueForecastReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState({
    monthlyForecast: [],
    quarterlyTargets: [],
    totalYearForecast: 0,
    totalYearTarget: 0,
    forecastAccuracy: 0,
    pipelineValue: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        const data = await getRevenueForecastReport();
        setForecastData(data);
      } catch (err) {
        setError('Failed to load revenue forecast data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, []);

  // Default data for development/fallback
  const defaultMonthlyForecast = [
    {
      month: "January",
      predicted: 1250000,
      actual: 1180000,
      variance: -5.6,
      confidence: 92
    },
    {
      month: "February",
      predicted: 1350000,
      actual: 1420000,
      variance: 5.2,
      confidence: 88
    },
    {
      month: "March",
      predicted: 1450000,
      actual: null,
      variance: null,
      confidence: 85
    },
    {
      month: "April",
      predicted: 1520000,
      actual: null,
      variance: null,
      confidence: 82
    },
    {
      month: "May",
      predicted: 1680000,
      actual: null,
      variance: null,
      confidence: 78
    },
    {
      month: "June",
      predicted: 1750000,
      actual: null,
      variance: null,
      confidence: 75
    }
  ];

  // Pipeline stages data
  const pipelineStages = [
    { stage: "Lead", deals: 45, value: 2250000, avgTime: 7, probability: 10 },
    { stage: "Qualified", deals: 32, value: 1920000, avgTime: 14, probability: 25 },
    { stage: "Proposal", deals: 18, value: 1440000, avgTime: 21, probability: 50 },
    { stage: "Negotiation", deals: 12, value: 1200000, avgTime: 28, probability: 75 },
    { stage: "Closed Won", deals: 8, value: 800000, avgTime: 35, probability: 100 },
  ];

  // Use API data if available, otherwise use default data
  const monthlyForecast = (forecastData.monthlyForecast && forecastData.monthlyForecast.length > 0)
    ? forecastData.monthlyForecast
    : defaultMonthlyForecast;

  const getConfidenceChip = (confidence) => {
    if (confidence >= 90) {
      return (
        <Chip
          label="High"
          sx={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else if (confidence >= 80) {
      return (
        <Chip
          label="Medium"
          sx={{
            backgroundColor: '#fff3cd',
            color: '#f57c00',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label="Low"
          sx={{
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      "on-track": { bg: '#e3f2fd', color: '#1976d2' },
      "ahead": { bg: '#e8f5e8', color: '#2e7d32' },
      "behind": { bg: '#ffebee', color: '#d32f2f' }
    };
    
    const colors = statusColors[status] || { bg: '#f5f5f5', color: '#616161' };
    
    return (
      <Chip
        label={status === "on-track" ? "On Track" : status === "ahead" ? "Ahead" : "Behind"}
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
        size="small"
      />
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const totalYearForecast = forecastData.totalYearForecast || 0;
  const totalYearTarget = forecastData.totalYearTarget || 0;
  const forecastAccuracy = forecastData.forecastAccuracy || 87;
  const pipelineValue = forecastData.pipelineValue || 8450000;
  const q1Performance = Math.round((2600000 / 4200000) * 100);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Pipeline by Stage
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Breakdown of deals and value by pipeline stage
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Deals</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Avg Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Win %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pipelineStages.map((stage, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{stage.stage}</TableCell>
                  <TableCell>{stage.deals}</TableCell>
                  <TableCell>{formatCurrency(stage.value)}</TableCell>
                  <TableCell>{stage.avgTime}d</TableCell>
                  <TableCell>{stage.probability}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueForecastReport;