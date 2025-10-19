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
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getActivitiesVsOutcomesReport } from '../../services/reportService';

const ActivitiesOutcomeReport = forwardRef((props, ref) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  useImperativeHandle(ref, () => ({
    getReportData: () => reportData
  }));

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
      "Call": { bg: theme.palette.mode === 'dark' ? '#1a237e' : '#e3f2fd', color: '#1976d2' },
      "Email": { bg: theme.palette.mode === 'dark' ? '#4a148c' : '#f3e5f5', color: '#7b1fa2' },
      "Meeting": { bg: theme.palette.mode === 'dark' ? '#1b5e20' : '#e8f5e8', color: '#388e3c' },
      "Demo": { bg: theme.palette.mode === 'dark' ? '#e65100' : '#fff3e0', color: '#f57c00' },
      "Follow-up": { bg: theme.palette.mode === 'dark' ? '#004d40' : '#e0f2f1', color: '#00695c' }
    };
    
    const colors = typeColors[type] || { 
      bg: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5', 
      color: theme.palette.mode === 'dark' ? '#bdbdbd' : '#616161' 
    };
    
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
      "Closed Won": { bg: theme.palette.mode === 'dark' ? '#1b5e20' : '#e8f5e8', color: '#2e7d32' },
      "Qualified": { bg: theme.palette.mode === 'dark' ? '#1a237e' : '#e3f2fd', color: '#1976d2' },
      "Proposal": { bg: theme.palette.mode === 'dark' ? '#e65100' : '#fff3cd', color: '#f57c00' },
      "Negotiation": { bg: theme.palette.mode === 'dark' ? '#e65100' : '#fff3e0', color: '#f57c00' },
      "Lost": { bg: theme.palette.mode === 'dark' ? '#b71c1c' : '#ffebee', color: '#d32f2f' },
      "No Response": { bg: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5', color: theme.palette.mode === 'dark' ? '#bdbdbd' : '#616161' }
    };
    
    const colors = outcomeColors[outcome] || { 
      bg: theme.palette.mode === 'dark' ? '#424242' : '#f5f5f5', 
      color: theme.palette.mode === 'dark' ? '#bdbdbd' : '#616161' 
    };
    
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
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Activities
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.totalActivities || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Activity Types
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.activityTypeCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Top Activity
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem', color: theme.palette.text.primary }}>
                  {summary.topActivityType ? summary.topActivityType.activityType : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.topActivityType ? `${summary.topActivityType.totalActivities} activities` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Best Conversion
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem', color: theme.palette.text.primary }}>
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
        <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Activity Conversion Rates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Success rates by activity type
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: theme.palette.background.paper }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Activity Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Total Activities</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Positive Outcomes</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Conversion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {conversionMetrics.map((metric, index) => (
                    <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <TableCell>
                        {getActivityTypeChip(metric.activityType)}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{metric.totalActivities}</TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{metric.positiveOutcomes}</TableCell>
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
      <Card sx={{ height: 'fit-content', backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Activities vs Outcomes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Breakdown of activity types and their outcomes
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: theme.palette.background.paper }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Activity Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Outcome</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activitiesData.map((activity, index) => (
                  <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                    <TableCell>
                      {getActivityTypeChip(activity.activityType)}
                    </TableCell>
                    <TableCell>
                      {getOutcomeChip(activity.outcome)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
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
});

ActivitiesOutcomeReport.displayName = 'ActivitiesOutcomeReport';

export default ActivitiesOutcomeReport;