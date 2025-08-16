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
import { getSalesPipelineReport } from '../../services/reportService';

const SalesPipelineReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipelineData, setPipelineData] = useState({
    data: [],           //  matches  backend response, might be why data wasnt loading
    summary: {
      totalDeals: 0,
      totalValue: 0,
      stageCount: 0
    },
    filters: {}
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        setLoading(true);
        const data = await getSalesPipelineReport();
        setPipelineData(data);
      } catch (err) {
        setError('Failed to load sales pipeline data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  // Default data for development/fallback
  const defaultPipelineStages = [
    {
      stage: "Prospecting",
      deals: 45,
      value: 2250000,
      avgDealSize: 50000,
      probability: 10,
      avgTime: 14
    },
    {
      stage: "Qualification",
      deals: 32,
      value: 1920000,
      avgDealSize: 60000,
      probability: 25,
      avgTime: 21
    },
    {
      stage: "Proposal",
      deals: 18,
      value: 1440000,
      avgDealSize: 80000,
      probability: 50,
      avgTime: 18
    },
    {
      stage: "Negotiation",
      deals: 12,
      value: 1320000,
      avgDealSize: 110000,
      probability: 75,
      avgTime: 12
    },
    {
      stage: "Closing",
      deals: 8,
      value: 960000,
      avgDealSize: 120000,
      probability: 90,
      avgTime: 8
    }
  ];

  const defaultTopDeals = [
    {
      id: 1,
      name: "Enterprise CRM Implementation",
      company: "Global Corp",
      value: 250000,
      stage: "Negotiation",
      probability: 85,
      closeDate: "2024-02-15",
      owner: "Sarah Johnson"
    },
    {
      id: 2,
      name: "Marketing Automation Suite",
      company: "Tech Solutions",
      value: 180000,
      stage: "Proposal",
      probability: 60,
      closeDate: "2024-02-28",
      owner: "Mike Wilson"
    },
    {
      id: 3,
      name: "Data Analytics Platform",
      company: "Finance Corp",
      value: 150000,
      stage: "Closing",
      probability: 95,
      closeDate: "2024-02-10",
      owner: "Emily Davis"
    },
    {
      id: 4,
      name: "Cloud Migration Project",
      company: "Manufacturing Inc",
      value: 120000,
      stage: "Qualification",
      probability: 30,
      closeDate: "2024-03-15",
      owner: "John Smith"
    }
  ];

  // Use API data if available, otherwise use default data
  const pipelineStages = (pipelineData.data && pipelineData.data.length > 0)
    ? pipelineData.data
    : defaultPipelineStages;
  const topDeals = (pipelineData.topDeals && pipelineData.topDeals.length > 0)
    ? pipelineData.topDeals
    : defaultTopDeals;

  const getProbabilityChip = (probability) => {
    if (probability >= 75) {
      return (
        <Chip
          label="High"
          sx={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else if (probability >= 50) {
      return (
        <Chip
          label="Medium"
          sx={{
            backgroundColor: '#fff3cd',
            color: '#f57c00',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else {
      return (
        <Chip
          label="Low"
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

  const getStageChip = (stage) => {
    const stageColors = {
      "Prospecting": { bg: '#f5f5f5', color: '#616161' },
      "Qualification": { bg: '#f0f0f0', color: '#000' },
      "Proposal": { bg: '#fff3cd', color: '#f57c00' },
      "Negotiation": { bg: '#fff3e0', color: '#f57c00' },
      "Closing": { bg: '#e8f5e8', color: '#2e7d32' }
    };
    
    const colors = stageColors[stage] || { bg: '#f5f5f5', color: '#616161' };
    
    return (
      <Chip
        label={stage}
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
  const totalPipelineValue = pipelineData.totalPipelineValue || pipelineStages.reduce((sum, stage) => sum + stage.value, 0);
  const totalDeals = pipelineData.totalDeals || pipelineStages.reduce((sum, stage) => sum + stage.deals, 0);
  const weightedValue = pipelineData.weightedValue || pipelineStages.reduce((sum, stage) => sum + (stage.value * stage.probability / 100), 0);
  const conversionRate = pipelineData.conversionRate || 24;

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
              <TableCell sx={{ fontWeight: 600 }}>Avg Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Win %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pipelineStages.map((stage, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 500 }}>{stage.stage}</TableCell>
                <TableCell>{stage.deals}</TableCell>
                <TableCell>{formatCurrency(stage.value)}</TableCell>
                <TableCell>{stage.avgTime}d</TableCell>
                <TableCell>{stage.probability}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);}
    

export default SalesPipelineReport;