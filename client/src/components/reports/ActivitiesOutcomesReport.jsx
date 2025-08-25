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
import { getActivitiesVsOutcomesReport } from '../../services/reportService';

const ActivitiesOutcomeReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchActivitiesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getActivitiesVsOutcomesReport();
        console.log('Activities API Response:', data);
        setReportData(data);
      } catch (err) {
        console.error('Activities API Error:', err);
        setError('Failed to load activities outcome data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivitiesData();
  }, []);

  const getActivityTypeChip = (type) => {
    const typeColors = {
      "Call": { bg: '#e3f2fd', color: '#1976d2' },
      "Email": { bg: '#f3e5f5', color: '#7b1fa2' },
      "Meeting": { bg: '#e8f5e8', color: '#388e3c' },
      "Demo": { bg: '#fff3e0', color: '#f57c00' },
      "Follow-up": { bg: '#e0f2f1', color: '#00695c' }
    };
    
    const colors = typeColors[type] || { bg: '#f5f5f5', color: '#616161' };
    
    return (
      <Chip
        label={type}
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
        size="small"
      />
    );
  };

  const getOutcomeChip = (outcome) => {
    const outcomeColors = {
      "Closed Won": { bg: '#e8f5e8', color: '#2e7d32' },
      "Qualified": { bg: '#e3f2fd', color: '#1976d2' },
      "Proposal": { bg: '#fff3cd', color: '#f57c00' },
      "Negotiation": { bg: '#fff3e0', color: '#f57c00' },
      "Lost": { bg: '#ffebee', color: '#d32f2f' },
      "No Response": { bg: '#f5f5f5', color: '#616161' }
    };
    
    const colors = outcomeColors[outcome] || { bg: '#f5f5f5', color: '#616161' };
    
    return (
      <Chip
        label={outcome}
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
        size="small"
      />
    );
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
        <Alert severity="info">No activities data available</Alert>
      </Box>
    );
  }

  const { data: activitiesData, summary, conversionMetrics, activitySummary } = reportData;

  return (
    <Box m={2}>
      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Activities
                </Typography>
                <Typography variant="h4" component="div">
                  {summary.totalActivities || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Activity Types
                </Typography>
                <Typography variant="h4" component="div">
                  {summary.activityTypeCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Top Activity
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem' }}>
                  {summary.topActivityType ? summary.topActivityType.activityType : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.topActivityType ? `${summary.topActivityType.totalActivities} activities` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Best Conversion
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem' }}>
                  {summary.bestConversionRate ? summary.bestConversionRate.activityType : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.bestConversionRate ? summary.bestConversionRate.formattedConversionRate : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Conversion Metrics Table */}
      {conversionMetrics && conversionMetrics.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Activity Conversion Rates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Success rates by activity type
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Activity Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Activities</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Positive Outcomes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Conversion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conversionMetrics.map((metric, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        {getActivityTypeChip(metric.activityType)}
                      </TableCell>
                      <TableCell>{metric.totalActivities}</TableCell>
                      <TableCell>{metric.positiveOutcomes}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: metric.conversionRate >= 50 ? '#2e7d32' : '#f57c00',
                            fontWeight: 500
                          }}
                        >
                          {metric.formattedConversionRate}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Activities Breakdown Table */}
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Activities vs Outcomes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Breakdown of activity types and their outcomes
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Activity Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Outcome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activitiesData.map((activity, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {getActivityTypeChip(activity.activityType)}
                    </TableCell>
                    <TableCell>
                      {getOutcomeChip(activity.outcome)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {activity.activityCount}
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

export default ActivitiesOutcomeReport;