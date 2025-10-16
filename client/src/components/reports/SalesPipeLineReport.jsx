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
import { useTheme } from '@mui/material/styles';
import { getSalesPipelineReport } from '../../services/reportService';

const SalesPipelineReport = forwardRef((props, ref) => {
  const theme = useTheme();
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
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Deals
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.totalDeals || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pipeline Value
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.formattedTotalValue || formatCurrency(summary.totalValue || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ backgroundColor: theme.palette.background.paper }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Stages
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: theme.palette.text.primary }}>
                  {summary.stageCount || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Pipeline Stages Table */}
      <Card sx={{ height: 'fit-content', backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Pipeline by Stage
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Breakdown of deals and value by pipeline stage
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ backgroundColor: theme.palette.background.paper }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Stage</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Deals</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Stage ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelineStages.map((stage, index) => (
                  <TableRow 
                    key={stage.stageId || index} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                      {stage.stageName || 'Unknown Stage'}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{stage.dealCount || 0}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>
                      {stage.formattedValue || formatCurrency(stage.totalValue || 0)}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{stage.stageId || 'N/A'}</TableCell>
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