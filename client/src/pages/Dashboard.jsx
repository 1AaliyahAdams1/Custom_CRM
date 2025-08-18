import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Container,
  CircularProgress,
} from "@mui/material";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalDeals: 0,
    totalAccounts: 0,
    totalActivities: 0,
    revenue: 0,
  });

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with actual API calls later
        setDashboardData({
          totalDeals: 156,
          totalAccounts: 89,
          totalActivities: 234,
          revenue: 485000,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "rgba(250, 250, 250, 1)",
        padding: 3,
      }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: "bold", color: "black", mb: 1 }}>
                CRM Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: "black" }}>
                Comprehensive view of your sales performance and pipeline
              </Typography>
            </Box>
            <Chip
              label={`Last updated: ${new Date().toLocaleDateString()}`}
              variant="outlined"
              sx={{
                color: "black",
                borderColor: "black",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </Box>

          {/* Key Metrics Grid */}
          <Grid container spacing={3}>
            {/* Total Deals Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                  color: "white",
                  height: "100%",
                }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Total Deals
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold" }}>
                    {dashboardData.totalDeals}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Active deals in pipeline
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Accounts Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                  color: "white",
                  height: "100%",
                }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Total Accounts
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold" }}>
                    {dashboardData.totalAccounts}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Active customer accounts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Activities Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, #ed6c02 0%, #e65100 100%)",
                  color: "white",
                  height: "100%",
                }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Total Activities
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold" }}>
                    {dashboardData.totalActivities}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Completed this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
                  color: "white",
                  height: "100%",
                }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold" }}>
                    ${(dashboardData.revenue / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    Total revenue this quarter
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Placeholder Section */}
          <Grid container spacing={3}>
            {/* Sales Pipeline Placeholder */}
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "300px",
                }}>
                <Box
                  sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}>
                    Sales Pipeline
                  </Typography>
                </Box>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "calc(100% - 80px)",
                  }}>
                  <Typography variant="body1" color="text.secondary">
                    Sales Pipeline Chart
                    <br />
                    <Typography variant="caption" color="text.disabled">
                      Chart component will be implemented here
                    </Typography>
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Revenue Trends Placeholder */}
            <Grid item xs={12} lg={6}>
              <Paper
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "300px",
                }}>
                <Box
                  sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}>
                    Revenue Trends
                  </Typography>
                </Box>
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "calc(100% - 80px)",
                  }}>
                  <Typography variant="body1" color="text.secondary">
                    Revenue Trends Chart
                    <br />
                    <Typography variant="caption" color="text.disabled">
                      Chart component will be implemented here
                    </Typography>
                  </Typography>
                </CardContent>
              </Paper>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                <Box
                  sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 600 }}>
                    Recent Activities
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(0, 0, 0, 0.6)", mt: 0.5 }}>
                    Latest updates from your team
                  </Typography>
                </Box>
                <CardContent>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[
                      {
                        action: "New deal created",
                        time: "2 hours ago",
                        type: "deal",
                      },
                      {
                        action: "Account updated",
                        time: "4 hours ago",
                        type: "account",
                      },
                      {
                        action: "Activity completed",
                        time: "6 hours ago",
                        type: "activity",
                      },
                      {
                        action: "New lead qualified",
                        time: "1 day ago",
                        type: "deal",
                      },
                    ].map((activity, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        }}>
                        <Typography variant="body2">
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
export { Dashboard };
