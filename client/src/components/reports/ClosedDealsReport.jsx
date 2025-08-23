import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getClosedDealsByPeriodReport } from '../../services/reportService';

const ClosedDealsReport = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Expose reportData to parent component
  useImperativeHandle(ref, () => ({
    getReportData: () => reportData
  }));

  // Fetch data on component mount
  useEffect(() => {
    const fetchClosedDealsData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use 'Closed Won' as the stage name, and no date filters for now
        const data = await getClosedDealsByPeriodReport('Closed Won');
        console.log('Closed Deals API Response:', data);
        setReportData(data);
      } catch (err) {
        console.error('Closed Deals API Error:', err);
        setError('Failed to load closed deals data');
      } finally {
        setLoading(false);
      }
    };

    fetchClosedDealsData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (!reportData || !reportData.data || reportData.data.length === 0) {
    return (
      <Box>
        <Alert severity="info">No closed deals data available</Alert>
      </Box>
    );
  }

  const { data: dealsData, summary } = reportData;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedTotalRevenue || formatCurrency(summary.totalRevenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Periods
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.periodCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Monthly Revenue
                </Typography>
                <Typography variant="h5" component="div">
                  {summary.formattedAverageMonthlyRevenue || formatCurrency(summary.averageMonthlyRevenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Highest Month
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem' }}>
                  {summary.highestMonth ? summary.highestMonth.periodFormatted : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.highestMonth ? summary.highestMonth.formattedTotalRevenue : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Deals Table */}
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Closed Deals by Period
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Revenue breakdown by time period
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Period (Raw)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealsData.map((deal, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {deal.periodFormatted || deal.period}
                      </Typography>
                    </TableCell>
                    <TableCell>{deal.period}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {deal.formattedTotalRevenue || formatCurrency(deal.totalRevenue || 0)}
                      </Typography>
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
});

ClosedDealsReport.displayName = 'ClosedDealsReport';

export default ClosedDealsReport;