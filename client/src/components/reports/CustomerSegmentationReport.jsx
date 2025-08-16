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
  LinearProgress
} from '@mui/material';
import { getCustomerSegmentationReport } from '../../services/reportService';

const CustomerSegmentationReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentationData, setSegmentationData] = useState({
    segments: [],
    industries: [],
    totalCustomers: 0,
    totalRevenue: 0,
    topSegment: '',
    growthLeader: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchSegmentationData = async () => {
      try {
        setLoading(true);
        const data = await getCustomerSegmentationReport();
        setSegmentationData(data);
      } catch (err) {
        setError('Failed to load customer segmentation data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentationData();
  }, []);

  // Default data for development/fallback
  const defaultSegments = [
    {
      id: 1,
      segment: "Enterprise",
      customerCount: 45,
      avgDealSize: 125000,
      totalRevenue: 5625000,
      growthRate: 15.2,
      tier: "high"
    },
    {
      id: 2,
      segment: "Mid-Market",
      customerCount: 128,
      avgDealSize: 45000,
      totalRevenue: 5760000,
      growthRate: 8.7,
      tier: "medium"
    },
    {
      id: 3,
      segment: "Small Business",
      customerCount: 324,
      avgDealSize: 12000,
      totalRevenue: 3888000,
      growthRate: 22.1,
      tier: "high"
    },
    {
      id: 4,
      segment: "Startup",
      customerCount: 89,
      avgDealSize: 8500,
      totalRevenue: 756500,
      growthRate: -3.2,
      tier: "low"
    }
  ];

  const defaultIndustries = [
    { name: "Technology", percentage: 35, customers: 198 },
    { name: "Healthcare", percentage: 22, customers: 127 },
    { name: "Finance", percentage: 18, customers: 104 },
    { name: "Manufacturing", percentage: 15, customers: 87 },
    { name: "Retail", percentage: 10, customers: 70 }
  ];

  // Use API data if available, otherwise use default data
  
  const segments = (segmentationData.segments && segmentationData.segments.length > 0)
    ? segmentationData.segments
    : defaultSegments;
  const industries = (segmentationData.industries && segmentationData.industries.length > 0)
    ? segmentationData.industries
    : defaultIndustries;

  const getTierChip = (tier) => {
    const tierColors = {
      high: { bg: '#e8f5e8', color: '#2e7d32' },
      medium: { bg: '#fff3cd', color: '#f57c00' },
      low: { bg: '#ffebee', color: '#d32f2f' }
    };

    const colors = tierColors[tier] || { bg: '#f5f5f5', color: '#616161' };
    const label = tier === 'high' ? 'High Value' : tier === 'medium' ? 'Medium Value' : 'Low Value';

    return (
      <Chip
        label={label}
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
  const totalCustomers = segmentationData.totalCustomers || segments.reduce((sum, segment) => sum + segment.customerCount, 0);
  const totalRevenue = segmentationData.totalRevenue || segments.reduce((sum, segment) => sum + segment.totalRevenue, 0);
  const topSegment = segmentationData.topSegment || "Mid-Market";
  const growthLeader = segmentationData.growthLeader || "Small Business";

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
        Segments by Size
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customer segments and their performance metrics
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Segment</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customers</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Avg Deal</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Growth</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {segments.map((segment) => (
              <TableRow key={segment.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>
                  {segment.segment}
                </TableCell>
                <TableCell>{segment.customerCount}</TableCell>
                <TableCell>{formatCurrency(segment.avgDealSize)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: segment.growthRate >= 0 ? '#2e7d32' : '#d32f2f',
                      fontWeight: 500
                    }}
                  >
                    {segment.growthRate >= 0 ? '+' : ''}{segment.growthRate}%
                  </Typography>
                </TableCell>
                <TableCell>{getTierChip(segment.tier)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);
};

export default CustomerSegmentationReport;