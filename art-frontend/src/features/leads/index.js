import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { openModal } from "../common/modalSlice";
import { showNotification } from "../common/headerSlice";
import axios from "../../utils/axios";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";
import { addNewLead } from "../leads/leadSlice";
import {useGetPaintingsQuery} from '../../utils/apiSlice'
import {useDeletePaintingsMutation} from '../../utils/apiSlice'
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import useWebSocketHook from '../../utils/useWebSocketHook';
import  StoppedIcon  from "./icons/stopped.svg";
import  RunningIcon  from "./icons/running.svg";
import  LoadingIcon  from "./icons/loading.svg";
import SelectBox from "../../components/Input/SelectBox";
import CustomDropdown from "../../components/Input/CustomDropdown";

const TopSideButtons = ({ fetchLeads }) => {
    const dispatch = useDispatch();

    const openAddNewLeadModal = () => {
        dispatch(
            openModal({
              title: "Add New Painting",
              bodyType: MODAL_BODY_TYPES.LEAD_ADD_NEW,
             
            })
          );
    };

    return (
      <div className="inline-block float-right">
    <button
        className="bg-blue-500 text-black  font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 ease-in-out flex items-center space-x-2"
        onClick={openAddNewLeadModal}
    >

        <span className="text-sm">Add New</span>
        <PlusIcon className="w-4 h-4 text-black" />
    </button>
</div>


    );
};


function Leads() {
    const [leads, setLeads] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const dispatch = useDispatch();
    let {data=[], error, isLoading : loading}= useGetPaintingsQuery()
    const [deletePaintings,{deletedata,isnotLoading,isSuccess}] = useDeletePaintingsMutation()
    const [expandedIndex, setExpandedIndex] = useState(null);
    const { messages, connectionStatus, isLoading: websocketLoading } = useWebSocketHook();
    const [statusByPainting, setStatusByPainting] = useState({}); // Track statuses dynamically by sys_id

    console.log('leads before effect',leads)
    console.log('data before effect',data?.data)

    // useEffect(() => {
    //     if (data?.data?.length > 0) {
    //         console.log('first useeffect, ' ,data?.data)
    //         setLeads((prev) => {
    //             // Filter out any items already in the state to prevent duplication
    //             // const newLeads = data.data.filter(
    //             //     (newLead) => !prev.some((lead) => lead.sys_id === newLead.sys_id)
    //             // );
    //             return [...prev, ...data.data];
    //         });
    //     }
    // }, [data]);

    useEffect(() => {
        if (data?.data?.length > 0) {
            console.log('first useeffect, ' ,data?.data)
            setLeads(data.data);
        }
    }, [data]);

      useEffect(() => {
        if (messages && messages.length > 0) {
          // Get the latest message (assuming messages is an array)
          const latestMessage = messages[messages.length - 1];
                console.log('lastest messages, ', latestMessage)
            // Update leads state
            setLeads((prevLeads) =>
                prevLeads.map((painting) => {
                    if (painting.sys_id === latestMessage.sys_id) {
                        if(latestMessage.status){
                            return {
                                ...painting,
                                status: latestMessage.status,
                                sensor: latestMessage.sensor
                            }
                        }else
                        return {
                            ...painting,
                            wheelchair: latestMessage.wheelchair,
                            sensor: latestMessage.sensor,
                            height_adjust: latestMessage.height_adjust,
                        };
                    }
                    return painting; // Return unchanged painting
                })
            );
        }
      }, [messages]);




    function editModalOpen(data){
        console.log(data)
        dispatch(openModal({ title: "Edit Painting", bodyType: MODAL_BODY_TYPES.PAINTING_EDIT , 
            extraObject: data
        }));
       
        closeModal();
    }

    

    // Handle deletion of a lead
    const handleDeleteLead = async (index) => {
        setDeleteMessage("");
        setIsDeleting(true);
        try {
            const leadToDelete = data.data[index];
            const res = await deletePaintings({ _id: leadToDelete.sys_id }).unwrap();
            if(res.success){
                dispatch(
                    showNotification({
                        message: "Painting deleted successfully",
                        status: 1,
                    })
                );
                // Update the array without mutating
                const updatedData = data.data.filter((_, i) => i !== index);

                // Update leads as an array, not an object
                setLeads(updatedData);
            }

        } catch (error) {
            console.error(error);
            dispatch(
                showNotification({
                    message: "Failed to delete painting. Please try again.",
                    status: 0,
                })
            );
        } finally {
            setIsDeleting(false);
            setConfirmDeleteIndex(null); // Reset confirmation
        }
    };


    // Handle editing a lead
    const handleEditLead = (data) => {
        editModalOpen(data)
        // setEditData(leadToEdit); // Open the Edit Modal with the selected painting's data
    };

    // Save the edited painting
    
    // Handle image click for modal
    const handleImageClick = (photo) => {
        setModalImage(photo);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImage(null);
    };

   
    const handleMoreInfo = (lead) => {
        dispatch(
            openModal({
                title: lead.name, // Set the painting name as the modal title
                bodyType: MODAL_BODY_TYPES.PAINTING_DETAILS, // Custom modal type
                extraObject: lead, // Pass the full painting object
            })
        );
    };
    

    {/* Define Status Inline */}
    const Status = ({ icon, label, explanation , sys_id}) => {

           // Function to handle API calls based on the selected option
    const handleSelectChange = async ({ updateType, value }) => {
        console.log(`Selected option for ${updateType}: ${value}`);

        try {
            if (value === 'active') {
                await axios.post(`/paintings/${sys_id}/active`, { status: 'active' });
                console.log('System activated via API');
            } else if (value === 'shutdown') {
                await axios.post(`/paintings/${sys_id}/shutdown`, { status: 'shutdown' });
                console.log('System deactivated via API');
            } else if (value === 'restart') {
                await axios.post(`/paintings/${sys_id}/restart`, { status: 'restart' });
                console.log('System set to restart via API');
            } else if (value === 'stop') {
                await axios.post(`/paintings/${sys_id}/stop_program`, { status: 'stop' });
                console.log('System set to restart via API');
            } else if (value === 'start') {
                await axios.post(`/paintings/${sys_id}/start_program`, { status: 'start' });
                console.log('System set to restart via API');
            } else {
                console.log('Unhandled option:', value);
            }
        } catch (error) {
            console.error('Error while making API call:', error);
        }
    };
        // Check if the label is "System Status"
        const isSystemStatus = label === "System Status";
        const RestartIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
            </svg>
        );
        
        
        return (
            <div
                className={`p-2 rounded-lg bg-gray-50 shadow border ${
                    isSystemStatus ? "grid grid-cols-3 gap-2 items-center" : "flex items-center gap-2"
                }`}
                style={{ borderColor: '#ddd' }}
            >
                {/* Column 1: Icon and Labels */}
                <div className={isSystemStatus ? "flex items-center col-span-2 gap-2" : "flex items-center gap-2"}>
                    {/* Icon */}
                    <img src={icon} alt={`${label} Icon`} className="w-6 h-6" />
    
                    {/* Labels */}
                    <div>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{label}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">{explanation}</p>
                    </div>
                </div>
    
                {/* Column 2: SelectBox (Only for "System Status") */}
                {isSystemStatus && (
                    <div className = {"flex item-center"}>
                        <CustomDropdown
                            // labelTitle="Select Status"
                            // labelDescription="Choose a status for the system"
                            defaultValue=""
                            containerStyle="w-min"
                            // placeholder="Choose a status..."
                            labelStyle="text-gray-700 font-medium"
                            icon= {<RestartIcon/>}

                            options={[
                             
                                // { name: 'Stop Program', value: 'stop' },
                                { name: "Choose a status...", value: '---' },
                                { name: 'Shutdown MicroController', value: 'shutdown' },
                                { name: 'Restart MicroController', value: 'restart' },
                                { name: 'Re/Start Program', value: 'start' },
                            ]}
                            updateType="status"
                            updateFormValue={(newValue) =>{
                                  console.log('Updated Form Value:', newValue)
                                handleSelectChange(newValue)
                            }
                              
                            }
                        />
                    </div>
                )}
            </div>
        );
    };
    

    return (
        <>
            <TitleCard
                title="Current Paintings"
                topMargin="mt-2"
                TopSideButtons={<TopSideButtons />}
            >
                
                {loading ? (
                    <p>Loading paintings...</p>
                    
                ) : (
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leads.map((lead, index) => (
                        <div
                            key={index}
                            className="card bg-base-100 shadow-xl  flex flex-col justify-between
                             p-4 bg-white rounded-lg shadow-md space-y-2 dark:bg-[#1f2937]  dark: text-white">
                            <div className={ "text-black  dark:text-white" }>
                                <img
                                    src={lead.photo || "/nophoto.jpg"}
                                    alt={lead.photo ? `${lead.name}'s painting` : "No photo available"}
                                    style={{
                                        height: "200px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        cursor: lead.photo ? "pointer" : "default",
                                        margin: "0 auto",
                                        display: "block",
                                    }}
                                    onClick={() =>
                                         {lead.photo && handleImageClick(lead.photo)}
                                       
                                        }
                                />
                                <h1 className="card-title text-center mt-2 font-bold">{lead.name} 
                                    <span style ={{fontSize : 'medium'}} className="font-normal ">{lead.painter_name}</span></h1>

                              {/* <div className="p-4 bg-white rounded-lg shadow-md space-y-2"></div> */}

                              <div className="badge-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

                                 {/* Status  */}
                                <div className="mt-2 space-y-2 sm:space-y-3">
                                  {/* System Status */}
                                    <Status
                                      icon={lead.status === "Active" ? RunningIcon : StoppedIcon}
                                      label="System Status"
                                      explanation={
                                        lead.status === "Active"
                                          ? "The system is online."
                                          : "The system is turned off."
                                      }
                                      sys_id = {lead.sys_id}
                                    />

                                          {/* Other Status  */}
                                          <Status
                                            icon={lead.sensor ? RunningIcon : StoppedIcon}
                                            label="Sensor"
                                            explanation={lead.sensor ? "A person is detected by the sensor." : "No person detected by the sensor."}
                                          />
                                          <Status
                                            icon={
                                                (() => {
                                                    console.log('lead.wheelchair', lead.wheelchair)
                                                    switch (lead.wheelchair) {
                                                        case 0:
                                                          return   StoppedIcon ;
                                                        case 1:
                                                            return LoadingIcon ; 
                                                        case 2:
                                                            return RunningIcon ; 
                                                        
                                                    }
                                                })()
                                            }
                                            label="Wheelchair"
                                            explanation={
                                                (() => {
                                                    switch (lead.wheelchair) {
                                                        case 0:
                                                            return "No wheelchair user detected.";
                                                        case 1:
                                                            return "Detecting a wheelchair user.";
                                                        case 2:
                                                            return "A person in a wheelchair has been detected.";
                                                    }
                                                })()
                                            }
                                          />
                                          <Status
                                            icon={lead.height_adjust ? RunningIcon : StoppedIcon}
                                            label="Height Adjust"
                                            explanation={lead.height_adjust ? "Adjusting the height for optimal visibility." : "No height adjustments currently in progress."}
                                          />

                                        </div>
                                        </div>

                                        </div>
                            <div className="flex justify-between items-center p-4 border-t">
                                                <div className="border-r pr-4">
                                                    <button
                                                        className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline"
                                                        onClick={() => handleEditLead(lead)}
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                        <span>Edit</span>
                                                    </button>
                                                </div>
                                                <div className="border-r pr-4">
                                                    <button
                                                        className="flex items-center space-x-2 text-red-500 border border-red-500 rounded-md px-3 py-1 hover:bg-red-100 transition duration-200 underline"
                                                        onClick={() => setConfirmDeleteIndex(index)}
                                                        disabled={isDeleting}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                        <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                                                    </button>
                                                </div>
                                                <div >
                                                    <button
                                                        className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline"
                                                        onClick={() => handleMoreInfo(lead)}
                                                    >

                                                        <span>Info</span>
                                                    </button>
                                                </div>
                                            </div>

                                                                </div>
                                                                ))}
                                                            </div>
                                                            )}
                                                            {deleteMessage && (
                                                                <div className="text-center text-red-500 mt-4">
                                                                    <p>{deleteMessage}</p>
                                                                </div>
                                                            )}
                                                        </TitleCard>

            
                                                            {/* Confirmation Modal for Deletion */}
                                                            {confirmDeleteIndex !== null && (
                                                                <div className="modal modal-open">
                                                                    <div className="modal-box text-center">
                                                                        {/* Close Button */}
                                                                        <button
                                                                            className="btn btn-sm btn-circle absolute right-2 top-2"
                                                                            onClick={() => setConfirmDeleteIndex(null)}
                                                                        >
                                                                            ✕
                                                                        </button>

                                                                        {/* Modal Title */}
                                                                        <h3 className="font-semibold text-2xl pb-4">Confirm Deletion</h3>

                                                                        {/* Modal Content */}
                                                                        <p className="text-lg mb-6">Are you sure you want to delete this painting?</p>

                                                                        {/* Action Buttons */}
                                                                  <div className="flex justify-center gap-4">
                                                                    {/* Cancel Button */}
                                                                    <button
                                                                      className="border border-gray-300 text-gray-700 py-2 px-6   font-medium rounded-md hover:bg-gray-100 transition duration-200"
                                                                      onClick={() => setConfirmDeleteIndex(null)}
                                                                    >
                                                                      Cancel
                                                                    </button>

                                                                    {/* Confirm Button */}
                                                                    <button
                                                                      className="bg-red-500 text-blsck py-2 px-6   font-medium rounded-md hover:bg-red-600 transition duration-200"
                                                                      onClick={() => handleDeleteLead(confirmDeleteIndex)}
                                                                    >
                                                                      Confirm
                                                                    </button>
                                                                  </div>
                                                                    </div>
                                                                </div>
                                                            )}




{isModalOpen && modalImage && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    {/* Close Button */}
    <button
      className="btn btn-sm btn-circle absolute right-2 top-2"
      onClick={closeModal}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1001, // Ensure button is above the image
      }}
    >
      ✕
    </button>
{/* Edit Button */}


    {/* Larger Image */}
    <img
      src={modalImage}
      alt="Larger painting view"
      style={{
        width: "auto",       // Original aspect ratio
        height: "90vh",      // Make it nearly as tall as the viewport
        maxWidth: "90vw",    // Fit inside viewport width
        objectFit: "contain",
        borderRadius: "8px",
      }}
    />
  </div>
)}


                        
              
        
        </>
    );
}

export default Leads;
