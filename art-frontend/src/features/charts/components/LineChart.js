import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';
  import TitleCard from '../../../components/Cards/TitleCard';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  function StackBarChart({ data, dateRange }) {
    const options = {
      responsive: true,
      indexAxis: 'y', // Switch x and y axes
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Total Duration (seconds)", // Update x-axis title
          },
          stacked: true, // Enable stacking on x-axis
        },
        y: {
          title: {
            display: true,
            text: "Painting Name", // Update y-axis title
          },
          stacked: true, // Enable stacking on y-axis
        },
      },
    };
  
    // Filter and aggregate total duration within the selected date range
    const labels = data.map(item => `${item.name}`); // Painting names
    const totalDurations = data.map(item => {
      // Filter `dailyStats` by selected date range
      const filteredStats = item.dailyStats.filter(stat => {
        const statDate = new Date(stat.date);
        return (
          statDate >= new Date(dateRange.startDate) &&
          statDate <= new Date(dateRange.endDate)
        );
      });
      // Sum durations within the date range
      return filteredStats.reduce((sum, stat) => sum + stat.totalDuration, 0);
    });
  
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Total Duration (seconds)',
          data: totalDurations,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
      ],
    };
  
    return (
      <TitleCard title={"Total Time Viewed"}>
        <Bar data={chartData} options={options} />
      </TitleCard>
    );
  }
  
  export default StackBarChart;
  