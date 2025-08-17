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
        setError('Failed to load revenue forecast data - using demo data');
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

  const defaultQuarterlyTargets = [
    {
      quarter: "Q1 2024",
      target: 4200000,
      forecast: 4050000,
      actual: 2600000,
      status: "behind"
    },
    {
      quarter: "Q2 2024",
      target: 4800000,
      forecast: 4650000,
      actual: null,
      status: "on-track"
    },
    {
      quarter: "Q3 2024",
      target: 5200000,
      forecast: 5100000,
      actual: null,
      status: "on-track"
    },
    {
      quarter: "Q4 2024",
      target: 5500000,
      forecast: 5300000,
      actual: null,
      status: "ahead"
    }
  ];

  // Use API data if available, otherwise use default data
  const monthlyForecast = (forecastData.monthlyForecast && forecastData.monthlyForecast.length > 0)
    ? forecastData.monthlyForecast
    : defaultMonthlyForecast;

  const quarterlyTargets = (forecastData.quarterlyTargets && forecastData.quarterlyTargets.length > 0)
    ? forecastData.quarterlyTargets
    : defaultQuarterlyTargets;

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

  const getVarianceChip = (variance) => {
    if (variance === null || variance === undefined) {
      return (
        <Chip
          label="TBD"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#616161',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    }

    if (variance > 0) {
      return (
        <Chip
          label={`+${variance.toFixed(1)}%`}
          sx={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label={`${variance.toFixed(1)}%`}
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
    if (amount === null || amount === undefined) return 'TBD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const totalYearForecast = forecastData.totalYearForecast || 19700000;
  const totalYearTarget = forecastData.totalYearTarget || 19700000;
  const forecastAccuracy = forecastData.forecastAccuracy || 87;
  const pipelineValue = forecastData.pipelineValue || 8450000;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Box mb={2}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

      {/* Summary Cards will add this to dashboard
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Year Forecast
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalYearForecast)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Year Target
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalYearTarget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Forecast Accuracy
              </Typography>
              <Typography variant="h4" component="div">
                {forecastAccuracy}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pipeline Value
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(pipelineValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Monthly Forecast Table */}
      <Card sx={{ height: 'fit-content', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Monthly Revenue Forecast
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Predicted vs actual revenue by month
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Predicted</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actual</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Variance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyForecast.map((forecast, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{forecast.month}</TableCell>
                    <TableCell>{formatCurrency(forecast.predicted)}</TableCell>
                    <TableCell>{formatCurrency(forecast.actual)}</TableCell>
                    <TableCell>{getVarianceChip(forecast.variance)}</TableCell>
                    <TableCell>{getConfidenceChip(forecast.confidence)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quarterly Targets Table dont know if we want this can add later to its own tab??
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Quarterly Targets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Target vs forecast vs actual by quarter
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Quarter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Target</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Forecast</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actual</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quarterlyTargets.map((quarter, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{quarter.quarter}</TableCell>
                    <TableCell>{formatCurrency(quarter.target)}</TableCell>
                    <TableCell>{formatCurrency(quarter.forecast)}</TableCell>
                    <TableCell>{formatCurrency(quarter.actual)}</TableCell>
                    <TableCell>{getStatusChip(quarter.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card> */}
    </Box>
  );
};

export default RevenueForecastReport;