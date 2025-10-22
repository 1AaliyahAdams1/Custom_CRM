import React, { useEffect, useState } from "react";
import { Box, Alert, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getSalesPipelineReport,
  getRevenueForecastReport,
  getClosedDealsByPeriodReport,
  getCustomerSegmentationReport,
  getActivitiesVsOutcomesReport,
} from "../services/reportService";

import SalesPipelineChart from "../components/dashboardCharts/SalesPipelineChart";
import RevenueChart from "../components/dashboardCharts/RevenueForecastChart";
import ClosedDealsChart from "../components/dashboardCharts/ClosedDealsChart";
import CustomerSegmentChart from "../components/dashboardCharts/CustomerSegmentationChart";
import ActivitiesOutcomesChart from "../components/dashboardCharts/ActivitiesOutcomesChart";
import WelcomeBanner from "../components/WelcomeBanner";
import ChartCard from "../components/dashboardCharts/ChartCard";
import LoadingScreen from "../components/LoadingScreen";
import { useContext } from "react";
import { AuthContext } from "../context/auth/authContext";
import { Star } from "@mui/icons-material";

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  
  // Get user's roles array
  const userRoles = user?.roles || [];
  
  const [data, setData] = useState({
    salesPipeline: null,
    revenue: null,
    closedDeals: null,
    customers: null,
    activities: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine which charts to show based on role
  const showActivitiesChart = userRoles.includes("Sales Representative");
  const showManagementCharts = userRoles.some(role => 
    ["C-level", "Sales Manager", "HR Manager"].includes(role)
  );

  // Inspirational quotes for sales reps
  const quotes = [
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier"
    },
    {
      text: "The difference between who you are and who you want to be is what you do.",
      author: "Unknown"
    },
    {
      text: "Every sale has five basic obstacles: no need, no money, no hurry, no desire, no trust.",
      author: "Zig Ziglar"
    },
    {
      text: "Quality performance starts with a positive attitude.",
      author: "Jeffrey Gitomer"
    },
    {
      text: "Your attitude, not your aptitude, will determine your altitude.",
      author: "Zig Ziglar"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson"
    },
    {
      text: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Unknown"
    },
    {
      text: "People don't buy for logical reasons. They buy for emotional reasons.",
      author: "Zig Ziglar"
    },
    {
      text: "Make a customer, not a sale.",
      author: "Katherine Barchetti"
    },
    {
      text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
      author: "Stephen Covey"
    },
    {
      text: "Every contact we have with a customer influences whether or not they'll come back.",
      author: "Unknown"
    },
    {
      text: "Sales are contingent upon the attitude of the salesman, not the attitude of the prospect.",
      author: "William Clement Stone"
    },
    {
      text: "You don't close a sale; you open a relationship if you want to build a long-term, successful enterprise.",
      author: "Patricia Fripp"
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb"
    },
    {
      text: "If you are not taking care of your customer, your competitor will.",
      author: "Bob Hooey"
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs"
    },
    {
      text: "Approach each customer with the idea of helping them solve a problem or achieve a goal.",
      author: "Brian Tracy"
    },
    {
      text: "Always do your best. What you plant now, you will harvest later.",
      author: "Og Mandino"
    },
    {
      text: "The golden rule for every business is this: Put yourself in your customer's place.",
      author: "Orison Swett Marden"
    },
    {
      text: "Opportunities don't happen. You create them.",
      author: "Chris Grosser"
    },
    {
      text: "I find that the harder I work, the more luck I seem to have.",
      author: "Thomas Jefferson"
    },
    {
      text: "Success usually comes to those who are too busy to be looking for it.",
      author: "Henry David Thoreau"
    },
    {
      text: "Persistence and determination alone are omnipotent.",
      author: "Calvin Coolidge"
    },
    {
      text: "It's not about having the right opportunities. It's about handling the opportunities right.",
      author: "Mark Hunter"
    },
    {
      text: "Stop selling. Start helping.",
      author: "Zig Ziglar"
    },
    {
      text: "In sales, a referral is the key to the door of resistance.",
      author: "Bo Bennett"
    },
    {
      text: "Pretend that every single person you meet has a sign around their neck that says 'Make me feel important.'",
      author: "Mary Kay Ash"
    },
    {
      text: "You'll never change your life until you change something you do daily.",
      author: "John C. Maxwell"
    },
    {
      text: "A goal without a plan is just a wish.",
      author: "Antoine de Saint-Exupéry"
    },
    {
      text: "Either you run the day or the day runs you.",
      author: "Jim Rohn"
    },
    {
      text: "Motivation is what gets you started. Habit is what keeps you going.",
      author: "Jim Ryun"
    }
  ];

  const [dailyQuote] = useState(() => {
    const today = new Date().getDate();
    return quotes[today % quotes.length];
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Create array of promises based on role
        const promises = [];
        
        // Management sees these charts
        if (showManagementCharts) {
          promises.push(
            getSalesPipelineReport(),
            getRevenueForecastReport(),
            getClosedDealsByPeriodReport(),
            getCustomerSegmentationReport()
          );
        } else {
          // Add null placeholders for management charts
          promises.push(null, null, null, null);
        }
        
        // Sales reps see activities chart
        if (showActivitiesChart) {
          promises.push(getActivitiesVsOutcomesReport());
        } else {
          promises.push(null);
        }

        const [
          salesPipeline,
          revenue,
          closedDeals,
          customers,
          activities,
        ] = await Promise.all(promises);

        setData({
          salesPipeline,
          revenue,
          closedDeals,
          customers,
          activities,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [showActivitiesChart, showManagementCharts]);

  if (loading) return <LoadingScreen message="Loading dashboard data..." />;
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}
    >
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Sales Rep Layout - Single centered chart with quote */}
      {showActivitiesChart && !showManagementCharts && (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            flex: 1,
            width: '100%',
            maxWidth: '1400px',
            mx: 'auto',
          }}
        >
          {/* Inspirational Quote */}
          <Paper
            elevation={2}
            sx={{
              width: '100%',
              p: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Star sx={{ color: theme.palette.primary.main }} />
                <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Daily Inspiration
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontStyle: 'italic',
                  color: theme.palette.text.primary,
                  mb: 1,
                  lineHeight: 1.6
                }}
              >
                "{dailyQuote.text}"
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  textAlign: 'right',
                  fontWeight: 500
                }}
              >
                — {dailyQuote.author}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
              }}
            />
          </Paper>

          {/* Activities Chart */}
          {data.activities && (
            <Box sx={{ width: '100%' }}>
              <ChartCard title="">
                <Box sx={{ height: { xs: '450px', md: '550px', lg: '600px' } }}>
                  <ActivitiesOutcomesChart data={data.activities} />
                </Box>
              </ChartCard>
            </Box>
          )}
        </Box>
      )}

      {/* Management Layout - Grid of charts */}
      {showManagementCharts && (
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 3,
            flex: 1
          }}
        >
          {/* Row 1 */}
          {data.salesPipeline && (
            <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
              <ChartCard title="Sales Pipeline">
                <SalesPipelineChart data={data.salesPipeline} />
              </ChartCard>
            </Box>
          )}
          {data.revenue && (
            <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
              <ChartCard title="Revenue Forecast">
                <RevenueChart data={data.revenue} />
              </ChartCard>
            </Box>
          )}

          {/* Row 2 */}
          {data.closedDeals && (
            <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
              <ChartCard title="Closed Deals Revenue Trend">
                <ClosedDealsChart data={data.closedDeals} />
              </ChartCard>
            </Box>
          )}
          {data.customers && (
            <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 6' } }}>
              <ChartCard title="Customer Segmentation">
                <CustomerSegmentChart data={data.customers} />
              </ChartCard>
            </Box>
          )}

          {/* Row 3 - Activities chart for management if they have it */}
          {data.activities && (
            <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 12' } }}>
              <ChartCard title="">
                <ActivitiesOutcomesChart data={data.activities} />
              </ChartCard>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;