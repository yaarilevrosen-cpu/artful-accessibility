import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import TitleCard from "../../components/Cards/TitleCard";
import logo from '../protected/Photos/logo.png';

function ManagerWelcomePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Welcome' }));
  }, [dispatch]);

  return (
    <TitleCard>
    {/* Logo Section */}
    <div className="flex justify-center mb-8">
      <div
        className="p-4 rounded-full border-4 border-yellow-500 bg-gray-100 dark:bg-gray-800 shadow-lg"
        style={{ width: "180px", height: "180px" }}
      >
        <img
          src={logo}
          alt="Hecht Museum Logo"
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    </div>
  
    {/* Title Section */}
    <div className="text-center mb-10 space-y-6">
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        Welcome Admin
      </h1>
      <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-700 dark:text-gray-300">
        To the Hecht Museum Management System
      </h2>
      <div className="flex justify-center mt-4">
        <div className="w-32 h-1 bg-yellow-500 rounded-full"></div>
      </div>
    </div>
  
    {/* About Section */}
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        About the System
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          The Hecht Museum Management System is designed to help staff
          efficiently manage paintings integrated into the automated height
          adjustment system. It also provides a detailed analysis of system
          performance and visitor interaction data, making museum operations
          smoother and more insightful.
      </p>
    </section>
  
    {/* Admin Features Section */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
    Your Admin Tools
  </h2>
  <ul className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed space-y-4 list-disc list-inside">
    <li>
      <strong>Add New Paintings:</strong> Easily integrate new artworks into the automated adjustment system.
    </li>
    <li>
      <strong>Edit Artwork Details:</strong> Update information such as dimensions and system status (Active/InActive).
    </li>
    <li>
      <strong>Delete Paintings:</strong> Remove artworks no longer in use.
    </li>
    <li>
      <strong>View Analytics:</strong> Real-time data on painting views, visitor engagement, and trends. Includes:
      <ul className="list-disc pl-6 mt-2">
        <li>Live statistics on current artworks.</li>
        <li>Historical data for deleted artworks.</li>
      </ul>
    </li>
    <li>
    
   
  <strong>System Tracking:</strong> View the <strong>System Status Panel</strong> under each painting in real time to monitor:
  <ul className="list-disc list-inside pl-6">
    <li><strong>System Status:</strong> Shows if the system is working properly.</li>
    <li><strong>Sensor Activity:</strong> Detects if a person is near the painting.</li>
    <li><strong>Wheelchair Detection:</strong> Detects people in wheelchairs for height adjustments.</li>
    <li><strong>Height Adjustment:</strong> Shows if the painting's height is being adjusted.</li>
  </ul>
</li>


    
    <li>
      <strong>Export Reports:</strong> Download detailed CSV reports for offline analysis.
    </li>
    <li>
      <strong>Custom Date Filters:</strong> Analyze data within specific periods to uncover meaningful insights.
    </li>
    <li>
      <strong>Enlarge Artwork Photos:</strong> Open a detailed view of any painting by clicking on its image.
    </li>
  </ul>
</section>

  
    {/* Help Section */}
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Need Help?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
        Access the Help section for a step-by-step guide on system usage,
        including:
      </p>
      <ul className="list-disc list-inside pl-4 mt-4 text-gray-700 dark:text-gray-300">
        <li>Adding, Editing, or Deleting paintings.</li>
        <li>How to access and interpret analysis reports.</li>
        <li>System Tracking </li>
      </ul>
    </section>
  
    {/* Call to Action */}
    <div className="text-center">
      <p className="text-lg text-gray-700 dark:text-gray-300 italic font-semibold mb-4">
      "Manage and analyze effortlessly. Click on a section to get started!"
      </p>
    </div>
  </TitleCard>
  
  );
}

export default ManagerWelcomePage;
