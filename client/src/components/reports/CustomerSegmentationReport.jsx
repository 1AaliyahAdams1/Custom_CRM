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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getCustomerSegmentationReport } from '../../services/reportService';

const CustomerSegmentationReport = forwardRef((props, ref) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentationData, setSegmentationData] = useState(null);
  const [segmentType, setSegmentType] = useState('Industry');

  // Expose reportData to parent component
  useImperativeHandle(ref, () => ({
    getReportData: () => segmentationData
  }));

  const segmentTypes = [
    { value: 'Industry', label: 'Industry' },
    { value: 'Size', label: 'Company Size' },
    { value: 'Country', label: 'Country' },
    { value: 'StateProvince', label: 'State/Province' },
    { value: 'City', label: 'City' }
  ];

  // Fetch data when component mounts or segmentType changes
  useEffect(() => {
    const fetchSegmentationData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerSegmentationReport(segmentType);
        console.log('Segmentation API Response:', data);
        setSegmentationData(data);
      } catch (err) {
        console.error('Segmentation API Error:', err);
        setError('Failed to load customer segmentation data');
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentationData();
  }, [segmentType]);

  const handleSegmentTypeChange = (event) => {
    setSegmentType(event.target.value);
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

  if (!segmentationData || !segmentationData.data || segmentationData.data.length === 0) {
    return (
      <Box>
        <Alert severity="info">No segmentation data available for {segmentType}</Alert>
      </Box>
    );
  }

  const { data: segments, summary, segmentTypeInfo } = segmentationData;

  return (
    <Box>
      {/* Segment Type Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Segment Type</InputLabel>
          <Select
            value={segmentType}
            label="Segment Type"
            onChange={handleSegmentTypeChange}
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.text.secondary
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main
              },
            }}
          >
            {segmentTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Customers
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.totalCustomers || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Segments
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.segmentCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Largest Segment
                </Typography>
                <Typography variant="h6" component="div" sx={{ fontSize: '1.2rem', color: theme.palette.text.primary }}>
                  {summary.largestSegment ? summary.largestSegment.segment : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.largestSegment ? `${summary.largestSegment.customerCount} customers` : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Avg per Segment
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.formattedAverageCustomersPerSegment || Math.round(summary.averageCustomersPerSegment || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Segment Type Information */}
      {segmentTypeInfo && (
        <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              About {segmentType} Segmentation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {segmentTypeInfo.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Use Case:</strong> {segmentTypeInfo.useCase}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Segments Table */}
      <Card sx={{ height: 'fit-content', backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Customer Segments by {segmentType}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Distribution of customers across different {segmentType.toLowerCase()} segments
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: theme.palette.background.paper }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{segmentType}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Customer Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {segments.map((segment, index) => (
                  <TableRow 
                    key={index} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                      {segment.segment}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{segment.customerCount}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2e7d32',
                          fontWeight: 500
                        }}
                      >
                        {segment.formattedPercentage || `${segment.percentage?.toFixed(1)}%`}
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

CustomerSegmentationReport.displayName = 'CustomerSegmentationReport';

export default CustomerSegmentationReport;