import React, { useState } from 'react';
import { useGetPaintingStatsQuery } from '../../utils/apiSlice';
import { useNavigate } from 'react-router-dom';
import StackBarChart from '../../features/charts/components/StackBarChart';
import LineChart from '../../features/charts/components/LineChart';
import Datepicker from "react-tailwindcss-datepicker";
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function Charts() {
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetPaintingStatsQuery();
    const [dateValue, setDateValue] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the current month
        endDate: new Date(), // Current date
    });

    const handleDatePickerValueChange = (newValue) => {
        setDateValue(newValue);
    };

    const paintingStats = data?.data?.filter(painting => !painting.isStill) || [];

    const filteredData = paintingStats.map((item) => ({
        ...item,
        dailyStats: item.dailyStats.filter((stat) => {
            const statDate = new Date(stat.date);
            return (
                statDate >= new Date(dateValue.startDate) &&
                statDate <= new Date(dateValue.endDate)
            );
        }),
    }));

    const topViewsPainting = filteredData.reduce(
        (top, painting) => (painting.totalViews > top.totalViews ? painting : top),
        { totalViews: 0, sys_id: "N/A", name: "N/A" }
    );

    const topDurationPainting = filteredData.reduce(
        (top, painting) =>
            painting.totalViewDuration > top.totalViewDuration ? painting : top,
        { totalViewDuration: 0, sys_id: "N/A", name: "N/A" }
    );

    const downloadCSV = () => {
        const csvHeaders = ['Artwork Name,Number of Views,Time Viewed (Seconds)'];
        const csvRows = paintingStats.map((painting) =>
            `${painting.name},${painting.totalViews},${painting.totalViewDuration}`
        ) || [];

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'painting_statistics.csv';
        link.click();
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                   
                </div>
                <div className="flex items-center space-x-4 mt-4 lg:mt-0 w-full">
  <div className="flex items-center space-x-4">
    <label htmlFor="date-range" className="text-gray-700 font-bold text-lg whitespace-nowrap">
      Select Date:
    </label>
    <Datepicker
  value={dateValue}
  theme="light"
  inputClassName="input input-bordered w-full lg:w-72 text-lg rounded-l-lg"
  toggleClassName="absolute bg-blue-500 hover:bg-blue-700 text-black rounded-r-lg top-0 right-0 h-full px-4 focus:outline-none transition duration-200 disabled:opacity-50"
  showShortcuts={true}
  popoverDirection="down"
  onChange={handleDatePickerValueChange}
  primaryColor="blue"
  configs={{
    shortcuts: {
      today: {
        text: "Today",
        period: {
          start: new Date(),
          end: new Date(),
        },
      },
      yesterday: {
        text: "Yesterday",
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 1)),
          end: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      last7Days: {
        text: "Last 7 Days",
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 7)),
          end: new Date(),
        },
      },
      thisMonth: {
        text: "This Month",
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(),
        },
      },
      lastMonth: {
        text: "Last Month",
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
      thisYear: {
        text: "This Year",
        period: {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date(),
        },
      },
    },
  }}
/>

    
  </div>
</div>



            </header>

            {/* Explanation Section */}
            <div className="mt-4 mb-8 text-center">
                <p className="text-gray-600 text-lg">
                    The statistics displayed on this page provide insights into <span className="font-semibold text-gray-800">deleted paintings</span>. 
                    This helps track their engagement and view history before they were removed.
                </p>
            </div>

            {/* Content Section */}
            {isLoading && <div className="text-center text-lg">Loading painting stats...</div>}
            {isError && <div className="text-red-500 text-center">Error loading painting stats. Please try again later.</div>}
            {!isLoading && !isError && paintingStats.length === 0 && (
                <div className="text-center text-gray-500">No history of deleted paintings available.</div>
            )}

            {!isLoading && !isError && paintingStats.length > 0 && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 flex items-center">
                            <ClockIcon className="w-10 h-10 text-black bg-gray-200 p-2 rounded-full" />
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">Longest Viewed Painting</h2>
                                <p className="text-gray-600">
                                    <strong>{topDurationPainting.name}</strong> with
                                    <span className="text-green-500 font-bold"> {topDurationPainting.totalViewDuration} seconds</span>.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 flex items-center">
                            <EyeIcon className="w-10 h-10 text-black bg-gray-200 p-2 rounded-full" />
                            <div className="ml-4">
                                <h2 className="text-2xl font-bold text-gray-800">Most Viewed Painting</h2>
                                <p className="text-gray-600 text-lg">
                                    <strong>{topViewsPainting.name}</strong> with
                                    <span className="text-blue-500 font-bold"> {topViewsPainting.totalViews} views</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mb-8">
                        <LineChart data={filteredData} dateRange={dateValue} />
                        <StackBarChart data={filteredData} dateRange={dateValue} />
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Painting Statistics</h2>
                            <button
                                onClick={downloadCSV}
                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-black px-6 py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 flex items-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <span className="font-medium">Download Report as CSV</span>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <table className="table-auto w-full text-left border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100 text-gray-800">
                                    <th className="border border-gray-300 px-2 py-2">Painting Name</th>
                                    <th className="border border-gray-300 px-2 py-2">Number of Views</th>
                                    <th className="border border-gray-300 px-2 py-2">Time Viewed (Seconds)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((painting) => (
                                    <tr key={painting.name} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-2 py-2">{painting.name}</td>
                                        <td className="border border-gray-300 px-2 py-2 text-blue-500 font-medium">
                                            {painting.totalViews}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-green-500 font-medium">
                                            {painting.totalViewDuration}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default Charts;
