import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTaskStatistics } from '../services/task.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['task-statistics'],
    queryFn: getTaskStatistics,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!statistics) {
    return (
      <Layout>
        <div className="text-center">No data available</div>
      </Layout>
    );
  }

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          statistics.data.byPriority.high,
          statistics.data.byPriority.medium,
          statistics.data.byPriority.low,
        ],
        backgroundColor: ['#ec4899', '#f59e0b', '#14b8a6'], // Rose, Amber, Teal
        borderColor: ['#be185d', '#d97706', '#0d9488'],
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ['Todo', 'In Progress', 'Done'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [statistics.data.todo, statistics.data.inProgress, statistics.data.completed],
        backgroundColor: ['#a855f7', '#ec4899', '#f59e0b'], // Purple, Rose, Amber
        borderColor: ['#9333ea', '#be185d', '#d97706'],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const completionRate = statistics.data.total > 0 
    ? Math.round((statistics.data.completed / statistics.data.total) * 100)
    : 0;

  return (
    <Layout>
      <div className="space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 min-h-screen -m-6 p-6">
        {/* Header with Vibrant Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
              📊 Dashboard
            </h1>
            <p className="text-pink-100 text-lg font-medium">Overview of your tasks and productivity</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 border-purple-200 dark:border-purple-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-700 dark:text-purple-300 font-medium">Total Tasks</CardDescription>
              <CardTitle className="text-4xl text-purple-800 dark:text-purple-200 font-bold">{statistics.data.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>All tasks</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border-amber-200 dark:border-amber-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-700 dark:text-amber-300 font-medium">Completed</CardDescription>
              <CardTitle className="text-4xl text-amber-800 dark:text-amber-200 font-bold">{statistics.data.completed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{completionRate}% completion</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 border-pink-200 dark:border-pink-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardDescription className="text-pink-700 dark:text-pink-300 font-medium">In Progress</CardDescription>
              <CardTitle className="text-4xl text-pink-800 dark:text-pink-200 font-bold">
                {statistics.data.inProgress}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Active now</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/40 dark:to-red-900/40 border-rose-200 dark:border-rose-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-2">
              <CardDescription className="text-rose-700 dark:text-rose-300 font-medium">Overdue</CardDescription>
              <CardTitle className="text-4xl text-rose-800 dark:text-rose-200 font-bold">{statistics.data.overdue}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Need attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-purple-900/30 backdrop-blur-sm border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200">Tasks by Priority</CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">Distribution of tasks by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={priorityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 dark:bg-purple-900/30 backdrop-blur-sm border-purple-200 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200">Tasks by Status</CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar 
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                        grid: {
                          color: 'rgba(168, 85, 247, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Progress */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-purple-900/30 backdrop-blur-sm border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-purple-800 dark:text-purple-200">Overall Progress</CardTitle>
            <CardDescription className="text-purple-600 dark:text-purple-400">Your task completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">Completion Rate</span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{completionRate}%</span>
              </div>
              <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.data.total - statistics.data.completed}</div>
                  <div className="text-sm text-purple-500 dark:text-purple-500">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{statistics.data.completed}</div>
                  <div className="text-sm text-amber-500 dark:text-amber-500">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{statistics.data.inProgress}</div>
                  <div className="text-sm text-pink-500 dark:text-pink-500">Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
