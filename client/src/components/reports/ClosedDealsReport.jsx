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
import { useTheme } from '@mui/material/styles';
import { getClosedDealsByPeriodReport } from '../../services/reportService';

const ClosedDealsReport = forwardRef((props, ref) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useImperativeHandle(ref, () => ({
    getReportData: () => reportData
  }));

  useEffect(() => {
    const fetchClosedDealsData = async () => {
      try {
        setLoading(true);
        setError(null);
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
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.formattedTotalRevenue || formatCurrency(summary.totalRevenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Periods
                </Typography>
                <Typography variant="h5" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.periodCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg Monthly Revenue
                </Typography>
                <Typography variant="h5" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.formattedAverageMonthlyRevenue || formatCurrency(summary.averageMonthlyRevenue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Highest Month
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', color: theme.palette.text.primary }}>
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
      <Card sx={{ height: 'fit-content', backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Closed Deals by Period
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Revenue breakdown by time period
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: theme.palette.background.paper }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Period (Raw)</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Total Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dealsData.map((deal, index) => (
                  <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                        {deal.periodFormatted || deal.period}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{deal.period}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
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