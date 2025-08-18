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
import { getClosedDealsByPeriodReport } from '../../services/reportService';

const ClosedDealsReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    deals: [],
    summary: {},
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchClosedDealsData = async () => {
      try {
        setLoading(true);
        const data = await getClosedDealsByPeriodReport();
        setReportData(data);
      } catch (err) {
        setError('Failed to load closed deals data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedDealsData();
  }, []);

  // Default data for development/fallback
  const defaultDeals = [
    {
      id: 1,
      dealName: "Enterprise Software License",
      client: "Acme Corporation",
      value: 150000,
      closeDate: "2024-01-15",
      salesperson: "John Doe",
      stage: "won",
      probability: 100
    },
    {
      id: 2,
      dealName: "Marketing Automation Platform",
      client: "Tech Innovations",
      value: 75000,
      closeDate: "2024-01-10",
      salesperson: "Jane Smith",
      stage: "won",
      probability: 100
    },
    {
      id: 3,
      dealName: "Cloud Infrastructure Setup",
      client: "Global Solutions",
      value: 45000,
      closeDate: "2024-01-08",
      salesperson: "Mike Johnson",
      stage: "lost",
      probability: 0
    },
    {
      id: 4,
      dealName: "Custom Development Project",
      client: "Startup Ventures",
      value: 120000,
      closeDate: "2024-01-05",
      salesperson: "Sarah Wilson",
      stage: "won",
      probability: 100
    },
    {
      id: 5,
      dealName: "Data Analytics Solution",
      client: "Finance Corp",
      value: 95000,
      closeDate: "2024-01-03",
      salesperson: "David Chen",
      stage: "won",
      probability: 100
    }
  ];

  // Use API data if available, otherwise use default data
;
  const deals = (reportData.deals && reportData.deals.length > 0)
    ? reportData.deals
    : defaultDeals;

  const getStatusChip = (stage) => {
    if (stage === 'won') {
      return (
        <Chip
          label="Won"
          sx={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            fontWeight: 500,
          }}
          size="small"
        />
      );
    } else if (stage === 'lost') {
      return (
        <Chip
          label="Lost"
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const totalWonValue = deals.filter(d => d.stage === 'won').reduce((sum, deal) => sum + deal.value, 0);
  const totalLostValue = deals.filter(d => d.stage === 'lost').reduce((sum, deal) => sum + deal.value, 0);
  const winRate = (deals.filter(d => d.stage === 'won').length / deals.length) * 100;
  const avgDealSize = deals.filter(d => d.stage === 'won').length > 0 
    ? totalWonValue / deals.filter(d => d.stage === 'won').length 
    : 0;

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
    <Box sx={{ width: '100%' }}>
      

      {/* Deals Table */}
      <Card sx={{ height: 'fit-content' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Closed Deals Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete list of recently closed deals
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Deal Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Close Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Salesperson</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {deal.dealName}
                      </Typography>
                    </TableCell>
                    <TableCell>{deal.client}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(deal.value)}
                      </Typography>
                    </TableCell>
                    <TableCell>{deal.closeDate}</TableCell>
                    <TableCell>{deal.salesperson}</TableCell>
                    <TableCell>
                      {getStatusChip(deal.stage)}
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

export default ClosedDealsReport;