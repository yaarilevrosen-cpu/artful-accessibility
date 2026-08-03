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
  import { useTranslation } from '../../../i18n';

  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  function StackBarChart({ data, dateRange }) {
    const { t } = useTranslation();
    const options = {
        responsive: true,
        indexAxis: 'y', // Switches the axes (horizontal bar chart)
        scales: {
            x: {
                title: {
                    display: true,
                    text: t('chart.axis.totalViews'), // Update the title for the new x-axis
                },
            },
            y: {
                title: {
                    display: true,
                    text: t('chart.axis.paintingName'), // Update the title for the new y-axis
                },
            },
        },
    };

    // Filter and aggregate total views within the selected date range
    const labels = data.map(item => ` ${item.name}`); // Painting names
    const totalViews = data.map(item => {
        // Filter `dailyStats` by selected date range
        const filteredStats = item.dailyStats.filter(stat => {
            const statDate = new Date(stat.date);
            return (
                statDate >= new Date(dateRange.startDate) &&
                statDate <= new Date(dateRange.endDate)
            );
        });
        // Sum views within the date range
        return filteredStats.reduce((sum, stat) => sum + stat.views, 0);
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: t('chart.axis.totalViews'),
                data: totalViews,
                borderColor: 'rgba(255, 99, 132, 1)', // Soft red for the line
                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Transparent red for fill
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Highlight points with red
                pointBorderColor: '#fff', // White border around points
                pointBorderWidth: 2,
                tension: 0.4, // Smooth line
            },
        ],
    };

    return (
        <TitleCard title={t('chart.totalViewsOverTime')} topMargin="mt-2">
            <Bar options={options} data={chartData} />
        </TitleCard>
    );
}

export default StackBarChart;
