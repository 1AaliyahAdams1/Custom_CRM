import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
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
  Grid,
} from '@mui/material';
import { getSalesPipelineReport } from '../../services/reportService';

const SalesPipelineReport = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipelineData, setPipelineData] = useState(null);

  // Expose reportData to parent component
  useImperativeHandle(ref, () => ({
    getReportData: () => pipelineData
  }));

  // Fetch data on component mount
  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSalesPipelineReport();
        console.log('Pipeline API Response:', data);
        setPipelineData(data);
      } catch (err) {
        console.error('Pipeline API Error:', err);
        setError('Failed to load sales pipeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
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

  if (!pipelineData || !pipelineData.data || pipelineData.data.length === 0) {
    return (
      <Box>
        <Alert severity="info">No pipeline data available</Alert>
      </Box>
    );
  }

  const { data: pipelineStages, summary } = pipelineData;

  return (
    <Box>
      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Deals
                </Typography>
                <Typography variant="h4" component="div">
                  {summary.totalDeals || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pipeline Value
                </Typography>
                <Typography variant="h4" component="div">
                  {summary.formattedTotalValue || formatCurrency(summary.totalValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Stages
                </Typography>
                <Typography variant="h4" component="div">
                  {summary.stageCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pipeline Stages Table */}
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
                  <TableCell sx={{ fontWeight: 600 }}>Stage ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelineStages.map((stage, index) => (
                  <TableRow key={stage.stageId || index} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {stage.stageName || 'Unknown Stage'}
                    </TableCell>
                    <TableCell>{stage.dealCount || 0}</TableCell>
                    <TableCell>
                      {stage.formattedValue || formatCurrency(stage.totalValue || 0)}
                    </TableCell>
                    <TableCell>{stage.stageId || 'N/A'}</TableCell>
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

SalesPipelineReport.displayName = 'SalesPipelineReport';

export default SalesPipelineReport;