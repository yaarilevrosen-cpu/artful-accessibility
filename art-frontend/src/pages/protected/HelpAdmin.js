import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import Success from '../protected/Photos/SuccessAdd.png';
import Failed from '../protected/Photos/failed.png';
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import Update from '../protected/Photos/SuccessUpdate.png';
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import Delete from '../protected/Photos/SuccessDelete.png';
import Confirm from '../protected/Photos/confirm.png';
import FailedDelete from '../protected/Photos/failed delete.png';
import StoppedIcon  from "../../features/leads/icons/stopped.svg";
import RunningIcon  from "../../features/leads/icons/running.svg";
import LoadingIcon from "../../features/leads/icons/loading.svg";
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import selectdate from '../protected/Photos/select date.png';
import status from '../protected/Photos/Status.png';
import menuButton from '../protected/Photos/button.png';
function InternalPage() {
    const dispatch = useDispatch();
   
    useEffect(() => {
        dispatch(setPageTitle({ title: "Help" }));
    }, []);

    return (
        <div className="p-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold mb-6 text-center">How to Use the System</h1>

            {/* Help Section */}
            <div className="space-y-8">
 {/* Section 1: Add New Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">Add New Painting</summary>
        <p className="mt-4">To add a new painting, follow these steps:</p>
        <ul className="list-decimal list-inside mb-4">
            <li>Go to the <strong>Manage Paintings</strong> page on the left sidebars.</li>
            <li className="flex items-center space-x-4">
                <span>Click the <strong>"Add New"</strong> button at the top-right corner.</span>
                <button
                    className="bg-blue-500 text-black font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 ease-in-out flex items-center space-x-2"
                >
                    <span className="text-sm">Add New</span>
                    <PlusIcon className="w-4 h-4 text-black" />
                </button>
            </li>
            <li>Fill in the following fields:</li>
            <ul className="list-disc list-inside pl-6 mb-4">
                <li>
                    <strong>Painting Name*</strong>: Enter a unique name for the painting. <span className="text-red-500">(Needed)</span>
                </li>
                <li>
                    <strong>Painter Name*</strong>: Provide the name of the artist who created the painting. <span className="text-red-500">(Needed)</span>
                </li>
                <li>
                    <strong>Base Height (cm)*</strong>: Specify the default base height for the painting. <span className="text-red-500">(Needed)</span>
                </li>
                <li>
                    <strong>Height (cm), Width (cm), Weight (kg) *</strong>: Enter the physical dimensions and weight of the painting. <span className="text-red-500">(Needed)</span>
                </li>
                <li>
                    <strong>Microcontroller</strong>: Enter the microcontroller Model to link the painting to the automated height adjustment system. <span className="text-gray-500">(Optional)</span>
                </li>
                <li>
                    <strong>Upload Photo</strong>: Upload an image of the painting. <span className="text-gray-500">(Optional)</span>
                </li>
            </ul>
            <li> Click <strong>Save</strong> to add the painting to the system, or click <strong>Cancel</strong> to discard the entry and exit without saving.</li>
            <li>
                Upon successful addition, a <strong>success message</strong> will confirm the painting has been added.
            </li>
            <img
                src={Success} 
                alt="Success Message"
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations Section */}
        <h3 className="text-xl font-semibold mt-6">Error Explanations</h3>
        <p className="mt-4">
            If the painting is not added successfully, here are some potential error messages and their resolutions:
        </p>
        <img
            src={Failed} 
            alt="Failed Message"
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>Disconnected from Backend:</strong> Ensure that your network connection is active and try again.
            </li>
            <li>
                <strong>Disconnected from Database:</strong> Verify that the database server is running and accessible. Check for database connection settings or restart the database service if necessary.
            </li>
            <li>
                <strong>Installation Failed - Timeout:</strong> Check the backend server status and verify that it is functioning correctly.
            </li>
            <li>
    <strong>Microcontroller Error:</strong> Verify that the microcontroller Model is correct, ensure it is powered on, available for linking, and not already assigned to another painting.
</li>


             
        </ul>
    </details>
</div>



                {/* Section 2: Edit Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">Edit a Painting</summary>
        <p className="mb-4 mt-4">To edit an existing painting, follow these steps:</p>
        <ul className="list-decimal list-inside mb-4">
            <li>Go to the <strong>Manage Paintings</strong> page.</li>
            <li>
                Locate the painting you want to edit and click the <strong>Edit</strong> button located below the painting's photo:
                <button
                    className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline mt-2"
                    onClick={() => console.log("Edit button clicked")}
                >
                    <PencilIcon className="w-5 h-5" />
                    <span>Edit</span>
                </button>
            </li>
            <li> Modify the fields in the form, including information about the painting such as dimensions, name, painter name, or system status (Active/Inactive).</li>
            <ul className="list-disc list-inside pl-6 mb-4"> 
            </ul>
            <li> Click <strong>Save</strong> to apply the changes, or click <strong>Cancel</strong> to discard the edits and exit the editing mode.</li>
            <li>
                Upon successful editing, a <strong>success message</strong> will confirm that the updates have been applied.
            </li>
            <img
                src={Update} 
                alt="Success Message"
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">Error Explanations</h3>
        <p className="mt-4">
            If the painting is not edited successfully, here are potential error messages and their resolutions:
        </p>
        <img
            src={Failed} 
            alt="Failed Message"
            className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>Disconnected from Database:</strong> Verify that the database server is running and accessible. Check for database connection settings or restart the database service if necessary.
            </li>
            <li>
                <strong>Disconnected from Backend:</strong> Ensure that your network connection is active and try again. Check the backend server status for connectivity issues.
            </li>
        </ul>
    </details>
</div>


                {/* Section 3: Delete Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">Delete a Painting</summary>
        <p className="mb-4 mt-4">To delete an existing painting, follow these steps:</p>
        <ul className="list-decimal list-inside mb-4">
            <li>Go to the <strong>Manage Paintings</strong> page.</li>
            <li>
                Locate the painting you want to delete and click the <strong>Delete</strong> button located below the painting's photo:
                <button
                    className="flex items-center space-x-2 text-red-500 border border-red-500 rounded-md px-3 py-1 hover:bg-red-100 transition duration-200 underline mt-2"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>Delete</span>
                </button>
            </li>
            <li>
                A confirmation modal will appear You can:
                <img
                    src={Confirm}  // Replace with the correct path to your success message image
                    alt="confirm  Message"
                    className="w-80 h-32 object-contain rounded-lg shadow-lg"
                />
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li>
                        Click <strong>Confirm</strong> to proceed with the deletion.
                    </li>
                    <li>
                        Click <strong>Cancel</strong> to cancel the deletion and exit the modal.
                    </li>
                </ul>
            </li>
            <li>
                Upon successful deletion, a <strong>success message</strong> will confirm that the painting has been removed:
                <img
                    src={Delete}  // Replace with the correct path to your success message image
                    alt="Success Message"
                    className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
                />
            </li>
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">Error Explanations</h3>
        <p className="mt-4">
            If the painting cannot be deleted, here are some potential error messages and their resolutions:
        </p>
        
        <img
            src={FailedDelete} 
            alt="Failed Message"
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>Disconnected from Database:</strong> Verify that the database server is running and accessible. Check the database connection settings or restart the database service if necessary.
            </li>
            <li>
                <strong>Disconnected from Backend:</strong> Ensure that your network connection is active and try again. Check the backend server status for connectivity issues.
            </li>
            <li>
                <strong>Microcontroller Not Found:</strong> Verify that the microcontroller associated with the painting's ID is powered on and functioning correctly.
            </li>
            <li>
                <strong>Cannot Delete ID from Microcontroller:</strong> The microcontroller might not allow the deletion of the painting's ID. Restart the microcontroller and try again.
            </li>
        </ul>
    </details>
</div>


{/* Section 4: View Painting Information */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">View Painting Information</summary>
        <p className="mb-4 mt-4">To view detailed information about a painting, follow these steps:</p>
        <ul className="list-decimal list-inside mb-4">
            <li>Go to the <strong>Manage Paintings</strong> page.</li>
            <li>
                Locate the painting you want to view and click the <strong>Info</strong> button located below the painting's photo:
                <button
                    className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline "
                  
                >
                    <span>Info</span>
                </button>
            </li>
            <li>
                A modal will appear, displaying detailed information about the painting, including:
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li><strong>ID:</strong> Unique identifier for the painting.</li>
                    <li><strong>Painter:</strong> Name of the artist.</li>
                    <li><strong>Base Height:</strong> The initial height of the painting.</li>
                    <li><strong>Height:</strong> The height of the painting in cm.</li>
                    <li><strong>Width:</strong> The width of the painting in cm.</li>
                    <li><strong>Weight:</strong> The weight of the painting in kg.</li>
                    <li><strong>Microcontroller:</strong> The microcontroller Type.</li>
                    <li>
                    <strong>Height Adjustment:</strong>
<span className="text-gray-500"> Calculated using the formula:</span>
<div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
    Height Adjustment = (Base Height + (Height / 2)) - Average Eye Level (cm)
</div>
<p className="mt-2">
    This formula adjusts the painting's height to match the average eye level of a person for comfortable and accessible viewing.
    <ul className="list-disc list-inside mt-2">
        <li><strong>Base Height:</strong> The distance from the floor to the bottom edge of the painting.</li>
        <li><strong>Height / 2:</strong> Calculates the middle point of the painting's height.</li>
        <li><strong>Average Eye Level:</strong> Represents the typical eye level of a person in a wheelchair (e.g., 119.25 cm).</li>
    </ul>
</p>
<p className="mt-2">
    <span className="text-red-500">
        If the adjustment value is "No Adjust," it means the painting's height is already optimal for viewing.
    </span>
</p>

                       
                    </li>
                    <li>
                        <strong>Optimal Viewing Distance:</strong>
                        <span className="text-gray-500"> Calculated as:</span>
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            Optimal Viewing Distance = 1.5 × Diagonal of the Painting
                        </div>
                        <p className="mt-2">
                            This calculates the optimal distance for viewing the painting based on its dimensions:
                            <ul className="list-disc list-inside mt-2">
                                <li>
                                    <strong>Diagonal:</strong> Calculated using the painting's height and width.
                                </li>
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
            Diagonal = √(Height² + Width²)
        </div>
                                <li>
                                    The factor of 1.5 ensures a comfortable viewing experience, widely used in museums and galleries.
                                </li>
                               
                            </ul>
                        </p>
                    </li>
                  
                </ul>
            </li>
        </ul>
    </details>
</div>



{/* Section 5: System Status Panel */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">System Status Panel</summary>
        <p className="mt-4">
            The System Status Panel is displayed under each painting in the <strong>Manage Paintings</strong> page. It provides real-time information about the system's components for that specific painting. Here's what each component indicates:
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>System Status:</strong>
                <p className="mt-2">
                    Displays the overall status of the system:
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                            <img
                                src={RunningIcon}
                                alt={`RunningIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                The system is running and fully operational.
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={StoppedIcon}
                                alt={`StoppedIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                The system is not operational. Check for network or backend connectivity issues.
                            </span>
                        </li>
                    </ul>
                </p>
               

<div className="text-center my-4">
            
        </div>
        <div className="flex items-center space-x-4 mt-2">
    {/* Text and Button Image */}
    <p>
        Next to the System Status A menu button allows staff to perform additional actions
    </p>
    <img
        src={menuButton} // Replace with the actual path to your menu button image
        alt="menu button"
        className="w-10 h-10 object-contain"
    />
</div>

<p className="mt-2">
    This is the menu:
</p>

<div className="text-center my-4">
    {/* Status Image */}
    <img
        src={status} 
        alt="status"
        className="w-40 h-28 object-contain rounded-lg shadow-md"
    />
</div>

<ul className="list-disc list-inside pl-6 mt-2">
    <li>
        <strong>Shutdown MicroController:</strong> Safely powers off the microcontroller to prevent data loss or hardware damage.
    </li>
    <li>
        <strong>Restart MicroController:</strong> Reboots the microcontroller to refresh all processes and resolve temporary issues.
    </li>
    <li>
        <strong>Re/Start Program:</strong> Restarts the running program without rebooting the hardware, allowing quick recovery and ensuring minimal downtime.
    </li>
</ul>

            </li>
            <li className="mt-4">
                <strong>Sensor:</strong>
                <p className="mt-2">
                    Indicates whether the sensor detects a person within the painting's **Optimal Viewing Distance**:
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                            <img
                                src={RunningIcon}
                                alt={`RunningIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                A person is detected within the optimal viewing distance.
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={StoppedIcon}
                                alt={`StoppedIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                No person is detected within the optimal viewing distance.
                            </span>
                        </li>
                    </ul>
                    <p className="mt-2">
                        The **Optimal Viewing Distance** is calculated as:
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            Optimal Viewing Distance = 1.5 × Diagonal of the Painting
                        </div>
                        <ul className="list-disc list-inside mt-2">
                            <li>
                                <strong>Diagonal:</strong> Calculated using the Pythagorean theorem:
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                                    Diagonal = √(Height² + Width²)
                                </div>
                            </li>
                            <li>
                                The sensor ensures that individuals within this distance are detected for interaction.
                            </li>
                        </ul>
                    </p>
                </p>
            </li>
            <li className="mt-4">
                <strong>Wheelchair:</strong>
                <p className="mt-2">
                    Monitors whether a wheelchair user has been detected:
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                            <img
                                src={LoadingIcon}
                                alt={`LoadingIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                Detecting a wheelchair user.
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={RunningIcon}
                                alt={`RunningIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                A wheelchair user is detected. The system will adjust the painting height accordingly.
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={StoppedIcon}
                                alt={`StoppedIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                No wheelchair user is detected.
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
            <li className="mt-4">
                <strong>Height Adjust:</strong>
                <p className="mt-2">
                    Displays the status of the height adjustment process:
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                            <img
                                src={RunningIcon}
                                alt={`RunningIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                Height adjustment is in progress.
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={StoppedIcon}
                                alt={`StoppedIcon`}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                No height adjustments are currently in progress.
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">Troubleshooting Tips</h3>
        <p className="mt-4">
            If any component is not functioning correctly, here are some steps to troubleshoot:
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>System Status:</strong> Check the backend server and ensure it is running. Verify network connectivity.
            </li>
            <li>
                <strong>Sensor:</strong> Ensure the sensor is powered on and properly connected. Check for any obstructions or misalignment.
            </li>
            <li>
                <strong>Wheelchair:</strong> Verify that the wheelchair detection module is active and calibrated correctly.
            </li>
            <li>
                <strong>Height Adjust:</strong> Ensure the motor and microcontroller are functioning. Restart the system if needed.
            </li>
        </ul>
    </details>
</div>

{/* Section: Analysis Features */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">Analysis Features</summary>
        <p className="mt-4">
            The Analysis section, available under the <strong>Analytics</strong> tab, provides powerful tools to track painting engagement, trends, and statistics. It includes two main features:
        </p>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>Live Charts:</strong> Displays real-time statistics for paintings currently in the system.
            </li>
            <li>
                <strong>History:</strong> Provides insights into paintings that have been removed from the system.
            </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">How It Works</h3>
        <p className="mt-4">
            Both Live Charts and History offer the following functionalities:
        </p>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>Date Range Filter:</strong> Use the date picker to select a specific time range. All statistics and charts are updated dynamically based on the selected dates.
                <div className="text-center my-4">
                    <img
                        src={selectdate} // Replace with the actual path
                        alt="Date Picker Screenshot"
                        className="w-full max-w-md rounded-lg shadow-md"
                    />
                </div>
            </li>
            <li>
  <strong>Charts:</strong> Explore interactive charts that visually present engagement trends and painting performance:
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      <strong>Line Chart:</strong> Displays the total viewing time for all paintings over the selected time range.
    </li>
    <li>
      <strong>Stacked Bar Chart:</strong> Compares the total number of views for each painting, helping identify the most popular artworks.
    </li>
    <li>
      These charts provide administrators with an intuitive way to analyze trends and patterns in viewer behavior.
    </li>
  </ul>
</li>

<li>
  <strong>Key Metrics:</strong>
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      <strong>Longest Viewed Painting:</strong> Identifies the painting with the highest total viewing time, reflecting its ability to hold viewer attention.
    </li>
    <li>
      <strong>Most Viewed Painting:</strong> Highlights the painting with the greatest number of views, showing its popularity among visitors.
    </li>
  </ul>
</li>

<li>
  <strong>Download Reports:</strong> Generate and export comprehensive reports for offline analysis:
  <button
                              
                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-black px-6 py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 flex items-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <span className="font-medium">Download Report as CSV</span>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      Click the <strong>Download Report as CSV</strong> button to export a detailed dataset.
    </li>
    <li>
      The report includes the sum of total views and total viewing time for each painting, along with all associated metrics.
    </li>
    <li>
      Use this feature to maintain detailed records and analyze data outside the system.
    </li>
  </ul>
</li>

        </ul>

       
        <h3 className="text-xl font-semibold mt-6">Error Troubleshooting</h3>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>Disconnected from Backend/Database:</strong> Verify your network connection and ensure the backend server is operational.
            </li>
        </ul>

       
    </details>
</div>









            </div>
        </div>
    );
}

export default InternalPage;
