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
  const [forecastData, setForecastData] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRevenueForecastReport();
        console.log('Forecast API Response:', data);
        setForecastData(data);
      } catch (err) {
        console.error('Forecast API Error:', err);
        setError('Failed to load revenue forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchForecastData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getVarianceChip = (actualRevenue, forecastRevenue) => {
    if (!actualRevenue || !forecastRevenue) {
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

    const variance = ((actualRevenue - forecastRevenue) / forecastRevenue) * 100;

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

  if (!forecastData || !forecastData.data || forecastData.data.length === 0) {
    return (
      <Box>
        <Alert severity="info">No forecast data available</Alert>
      </Box>
    );
  }

  const { data: monthlyForecast, summary } = forecastData;

  return (
    <Box>
      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Actual Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedTotalActualRevenue || formatCurrency(summary.totalActualRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Forecast Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedTotalForecastRevenue || formatCurrency(summary.totalForecastRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Monthly Actual
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedAverageMonthlyActual || formatCurrency(summary.averageMonthlyActual)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Monthly Forecast
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedAverageMonthlyForecast || formatCurrency(summary.averageMonthlyForecast)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Monthly Forecast Table */}
      <Card sx={{ height: 'fit-content' }}>
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
                  <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actual Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Forecast Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Variance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyForecast.map((forecast, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {forecast.periodFormatted || forecast.period}
                    </TableCell>
                    <TableCell>
                      {forecast.formattedActualRevenue || formatCurrency(forecast.actualRevenue)}
                    </TableCell>
                    <TableCell>
                      {forecast.formattedForecastRevenue || formatCurrency(forecast.forecastRevenue)}
                    </TableCell>
                    <TableCell>
                      {forecast.formattedTotalRevenue || formatCurrency(forecast.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {getVarianceChip(forecast.actualRevenue, forecast.forecastRevenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RevenueForecastReport;