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
  const [reportData, setReportData] = useState({
    activities: [],
    summary: {},
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchActivitiesData = async () => {
      try {
        setLoading(true);
        const data = await getActivitiesVsOutcomesReport();
        setReportData(data);
      } catch (err) {
        setError('Failed to load activities outcome data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivitiesData();
  }, []);

  // Default data for development/fallback
  const defaultActivities = [
    {
      id: 1,
      type: "Call",
      contact: "John Smith",
      company: "Acme Corp",
      outcome: "Interested",
      date: "2024-01-15",
      followUp: "2024-01-22",
      status: "success"
    },
    {
      id: 2,
      type: "Email",
      contact: "Sarah Johnson",
      company: "Tech Solutions",
      outcome: "No Response",
      date: "2024-01-14",
      followUp: "2024-01-21",
      status: "pending"
    },
    {
      id: 3,
      type: "Meeting",
      contact: "Mike Wilson",
      company: "Global Industries",
      outcome: "Proposal Sent",
      date: "2024-01-13",
      followUp: "2024-01-20",
      status: "success"
    },
    {
      id: 4,
      type: "Call",
      contact: "Lisa Brown",
      company: "Startup Inc",
      outcome: "Not Interested",
      date: "2024-01-12",
      followUp: null,
      status: "failed"
    },
    {
      id: 5,
      type: "Demo",
      contact: "Robert Davis",
      company: "Innovation Labs",
      outcome: "Scheduled Follow-up",
      date: "2024-01-11",
      followUp: "2024-01-18",
      status: "success"
    }
  ];

  // const defaultSummary = { this will be added to the dashboard
  //   totalActivities: 127,
  //   successRate: "68%",
  //   pendingFollowups: 23,
  //   avgResponseTime: "2.4h"
  // };

  // Use API data if available, otherwise use default data
  const activities = (reportData.activities && reportData.activities.length > 0) 
    ? reportData.activities 
    : defaultActivities;
  // const summary = (reportData.summary && Object.keys(reportData.summary).length > 0 && reportData.summary.totalActivities) 
  //   ? reportData.summary 
  //   : defaultSummary;

  const getStatusChip = (status) => {
    if (status === 'success') {
      return (
        <Chip
          label="Success"
          sx={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else if (status === 'pending') {
      return (
        <Chip
          label="Pending"
          sx={{
            backgroundColor: '#fff3cd',
            color: '#f57c00',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else if (status === 'failed') {
      return (
        <Chip
          label="Failed"
          sx={{
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label="Unknown"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#616161',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    }
  };

  const getActivityTypeChip = (type) => {
    const typeColors = {
      "Call": { bg: '#e3f2fd', color: '#1976d2' },
      "Email": { bg: '#f3e5f5', color: '#7b1fa2' },
      "Meeting": { bg: '#e8f5e8', color: '#388e3c' },
      "Demo": { bg: '#fff3e0', color: '#f57c00' }
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
    <Box m={2}>

      {/* Activities Table */}
      
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Recent Activities
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Latest sales activities and their outcomes
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Outcome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Follow-up</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      {getActivityTypeChip(activity.type)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {activity.contact}
                    </TableCell>
                    <TableCell>{activity.company}</TableCell>
                    <TableCell>{activity.outcome}</TableCell>
                    <TableCell>{activity.date}</TableCell>
                    <TableCell>{activity.followUp || "N/A"}</TableCell>
                    <TableCell>
                      {getStatusChip(activity.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
       
    </Box>
  );
};

export default ActivitiesOutcomeReport;