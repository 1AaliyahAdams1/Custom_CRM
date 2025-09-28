import React, { useEffect, useState } from "react";
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
import MetricsGrid from "../components/dashboardCharts/MetricsGrid";
import WelcomeBanner from "../components/WelcomeBanner";
import ChartCard from "../components/dashboardCharts/ChartCard";
import LoadingScreen from "../components/LoadingScreen";

const Dashboard = () => {
  const [data, setData] = useState({
    salesPipeline: null,
    revenue: null,
    closedDeals: null,
    customers: null,
    activities: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const [
          salesPipeline,
          revenue,
          closedDeals,
          customers,
          activities,
        ] = await Promise.all([
          getSalesPipelineReport(),
          getRevenueForecastReport(),
          getClosedDealsByPeriodReport(),
          getCustomerSegmentationReport(),
          getActivitiesVsOutcomesReport(),
        ]);

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
  }, []);

  if (loading) return <LoadingScreen message="Loading dashboard data..." />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* Welcome Banner */}
      <div className="col-span-12">
        <WelcomeBanner />
      </div>

      {/* KPI Cards */}
      <div className="col-span-12">
        <MetricsGrid />
      </div>

      {/* Row 1 */}
      <div className="col-span-12 lg:col-span-6">
        <ChartCard title="Sales Pipeline">
          <SalesPipelineChart data={data.salesPipeline} />
        </ChartCard>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <ChartCard title="Revenue Forecast">
          <RevenueChart data={data.revenue} />
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="col-span-12 lg:col-span-6">
        <ChartCard title="Closed Deals">
          <ClosedDealsChart data={data.closedDeals} />
        </ChartCard>
      </div>
      <div className="col-span-12 lg:col-span-6">
        <ChartCard title="Customer Segmentation">
          <CustomerSegmentChart data={data.customers} />
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="col-span-12 lg:col-span-6">
        <ChartCard title="Activities vs Outcomes">
          <ActivitiesOutcomesChart data={data.activities} />
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
