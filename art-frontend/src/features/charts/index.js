import React, { useState } from 'react';
import { useGetPaintingStatsQuery } from '../../utils/apiSlice';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import StackBarChart from './components/StackBarChart';
import LineChart from './components/LineChart';
import Datepicker from "react-tailwindcss-datepicker";
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../i18n';

function Charts() {
    const navigate = useNavigate(); // Initialize useNavigate
    const { t } = useTranslation();
    const { data, isLoading, isError } = useGetPaintingStatsQuery();
    const [dateValue, setDateValue] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of the current month
        endDate: new Date(), // Current date
        

    });

    const handleDatePickerValueChange = (newValue) => {
        setDateValue(newValue);
    };

    const paintingData = data?.data?.filter(painting => painting.isStill) || [];

    const filteredData = paintingData.map((item) => ({
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
        const csvHeaders = [t('chartsPage.csv.headers')];
        const csvRows = paintingData.map((painting) =>
            ` ${painting.name},${painting.totalViews},${painting.totalViewDuration}`
        );

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
                <div className="flex items-center gap-4">
                    
                </div>

                <div className="flex items-center gap-4 mt-4 lg:mt-0 w-full">
  <div className="flex items-center gap-4">
    <label htmlFor="date-range" className="text-gray-700 font-bold text-lg whitespace-nowrap">
      {t('chartsPage.selectDate')}
    </label>
    <Datepicker
  value={dateValue}
  theme="light"
  inputClassName="input input-bordered w-full lg:w-72 text-lg rounded-s-lg"
  toggleClassName="absolute bg-blue-500 hover:bg-blue-700 text-black rounded-e-lg top-0 end-0 h-full px-4 focus:outline-none transition duration-200 disabled:opacity-50"
  showShortcuts={true}
  popoverDirection="down"
  onChange={handleDatePickerValueChange}
  primaryColor="blue"
  configs={{
    shortcuts: {
      today: {
        text: t('chartsPage.shortcut.today'),
        period: {
          start: new Date(),
          end: new Date(),
        },
      },
      yesterday: {
        text: t('chartsPage.shortcut.yesterday'),
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 1)),
          end: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      last7Days: {
        text: t('chartsPage.shortcut.last7Days'),
        period: {
          start: new Date(new Date().setDate(new Date().getDate() - 7)),
          end: new Date(),
        },
      },
      thisMonth: {
        text: t('chartsPage.shortcut.thisMonth'),
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(),
        },
      },
      lastMonth: {
        text: t('chartsPage.shortcut.lastMonth'),
        period: {
          start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
      },
      thisYear: {
        text: t('chartsPage.shortcut.thisYear'),
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
                    {t('chartsPage.explanation')}
                </p>
            </div>

            {/* Content Section */}
            {isLoading && <div className="text-center text-lg">{t('chartsPage.loading')}</div>}
            {isError && <div className="text-red-500 text-center">{t('chartsPage.error')}</div>}
            {!isLoading && !isError && paintingData.length === 0 && (
                <div className="text-center text-gray-500">{t('chartsPage.noStats')}</div>
            )}

            {!isLoading && !isError && paintingData.length > 0 && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Longest Viewed Painting */}
                        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 flex items-center">
                            <ClockIcon className="w-10 h-10 text-black bg-gray-200 p-2 rounded-full" />
                            <div className="ms-4">
                                <h2 className="text-2xl font-bold text-gray-800">{t('chartsPage.longestViewed')}</h2>
                                <p className="text-gray-600">
                                    <strong>{topDurationPainting.name}</strong> {t('chartsPage.withDuration', { duration: topDurationPainting.totalViewDuration })}
                                </p>
                            </div>
                        </div>

                        {/* Most Viewed Painting */}
                        <div className="bg-white shadow-md rounded-lg p-6 border-t-4 flex items-center">
                            <EyeIcon className="w-10 h-10 text-black bg-gray-200 p-2 rounded-full" />
                            <div className="ms-4">
                                <h2 className="text-2xl font-bold text-gray-800">{t('chartsPage.mostViewed')}</h2>
                                <p className="text-gray-600 text-lg">
                                    <strong>{topViewsPainting.name}</strong> {t('chartsPage.withViews', { views: topViewsPainting.totalViews })}
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
                            <h2 className="text-xl font-semibold text-gray-800">{t('chartsPage.statisticsTitle')}</h2>
                            <button
                                onClick={downloadCSV}
                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-black px-6 py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 flex items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <span className="font-medium">{t('chartsPage.downloadCsv')}</span>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <table className="table-auto w-full text-start border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-100 text-gray-800">
                                    <th className="border border-gray-300 px-2 py-2">{t('chartsPage.table.name')}</th>
                                    <th className="border border-gray-300 px-2 py-2">{t('chartsPage.table.views')}</th>
                                    <th className="border border-gray-300 px-2 py-2">{t('chartsPage.table.duration')}</th>
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
