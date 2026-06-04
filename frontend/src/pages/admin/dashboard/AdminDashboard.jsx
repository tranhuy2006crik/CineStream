import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLang } from '../../../context/LanguageContext';
import { adminTranslations } from '../../../utils/adminTranslations';
import { DollarSign, Ticket, PlaySquare, Users, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPageHeader } = useOutletContext();
  const { lang } = useLang();
  const t = adminTranslations[lang] || adminTranslations.en;

  useEffect(() => {
    setPageHeader({
      title: t.dashTitle,
      description: t.dashDesc
    });
    return () => setPageHeader({ title: '', description: '', backLink: null, rightContent: null });
  }, [setPageHeader, t]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/stats/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="animate-spin text-primary-container" size={40} />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-on-surface">Failed to load statistics.</div>;
  }

  const kpiData = [
    { title: t.totalRevenue, value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.summary.totalRevenue), trend: '+14%', isPositive: true, icon: <DollarSign size={24} className="text-green-500" /> },
    { title: t.totalUsers, value: stats.summary.totalUsers.toLocaleString(), trend: '+5%', isPositive: true, icon: <Users size={24} className="text-blue-500" /> },
    { title: t.totalMovies, value: stats.summary.totalMovies.toLocaleString(), trend: '+2%', isPositive: true, icon: <PlaySquare size={24} className="text-primary-container" /> },
    { title: t.activePackages, value: stats.summary.totalPackages.toLocaleString(), trend: '+10%', isPositive: true, icon: <Ticket size={24} className="text-purple-500" /> },
  ];

  const lineChartData = {
    labels: stats.charts.revenue.labels,
    datasets: [
      {
        label: 'Revenue (VND)',
        data: stats.charts.revenue.data,
        borderColor: '#e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  const doughnutData = {
    labels: stats.charts.movies.labels,
    datasets: [
      {
        data: stats.charts.movies.data,
        backgroundColor: [
          '#e50914', // Showing
          '#3b82f6', // Upcoming
          '#8b5cf6', // Ended
          '#10b981', // VOD
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-surface-container-high rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5">
                {kpi.icon}
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded-md ${kpi.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {kpi.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{kpi.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-medium">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-on-surface mt-1 truncate">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-surface-container-high rounded-xl p-6 border border-white/5 lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-6">{t.revenueOverTime}</h2>
          <div className="h-[300px]">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-surface-container-high rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-bold text-on-surface mb-6">{t.movieDistribution}</h2>
          <div className="h-[250px] flex items-center justify-center relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
              <span className="text-3xl font-bold text-on-surface">{stats.summary.totalMovies}</span>
              <span className="text-xs text-on-surface-variant uppercase tracking-wider">{t.total}</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {stats.charts.movies.labels.map((label, i) => {
              const colors = ['bg-primary-container', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'];
              const value = stats.charts.movies.data[i];
              const percentage = stats.summary.totalMovies > 0 ? Math.round((value / stats.summary.totalMovies) * 100) : 0;
              return (
                <div key={label} className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]} mr-2`}></span>
                    {label}
                  </span>
                  <span className="font-bold">{percentage}% ({value})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
