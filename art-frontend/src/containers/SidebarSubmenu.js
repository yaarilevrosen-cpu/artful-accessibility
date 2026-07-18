import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function SidebarSubmenu({ submenu, name, icon },buttonClass) {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    /** Open Submenu list if path found in routes, this is for directly loading submenu routes first time */

    const sidebarButtonClass = `
    w-full group flex items-center space-x-4 py-3 px-4 rounded-md border 
    shadow-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
`;


    useEffect(() => {
        if (submenu.some((m) => m.path === location.pathname)) {
            setIsExpanded(true);
        } else {
            setIsExpanded(false); // Close submenu when route doesn't match
        }
    }, [submenu, location.pathname]);

    function redirect (){
        setIsExpanded(!isExpanded)
        console.log("here")

            navigate('/admin/Livecharts');

    }
    return (
        <div className="flex flex-col "
              // style={{ marginLeft: '-17px' }}
             style={{ paddingLeft: 0, paddingRight: 0 }}
        >
            <div

                className={`${sidebarButtonClass} ${
                    isExpanded
                        ? "bg-blue-500 text-white font-bold border-blue-500"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-500 hover:text-blue-600"
                }`}
                onClick={() => redirect()}
            >
                <span className="flex-shrink-0">{icon}</span>
                <span className="text-md font-medium flex-grow">{name}</span>
                <ChevronDownIcon
                    className={`w-5 h-5 ml-auto transform transition-transform duration-500 ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
            </div>

            {isExpanded && (
                <ul className="menu menu-compact bg-white rounded-md mt-1 shadow-sm border border-gray-300 ">
                    {submenu.map((m, k) => {
                        const isActive = location.pathname === m.path;
                        return (
                            <li key={k}>
                                <Link
                                    to={m.path}
                                    className={`${buttonClass} ${
                                        isActive
                                            ? "bg-blue-500 text-white font-bold border-blue-500"
                                            : "bg-white text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-500 hover:text-blue-600"
                                    }`}
                                >
                                    <span>{m.icon}</span>
                                    <span className="text-md font-medium">{m.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}


export default SidebarSubmenu;
