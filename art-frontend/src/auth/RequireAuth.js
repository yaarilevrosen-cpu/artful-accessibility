import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Navigate, Outlet, Link } from 'react-router-dom';

function RequireAuth({ allowedRoles }) {
    // const user = useSelector(selectCurrentUser);
    const user = localStorage.getItem("user");
    const dispatch = useDispatch();
    const [shouldLogout, setShouldLogout] = useState(false); // Track logout state
    const LSUser = JSON.parse(localStorage.getItem('user'));
    console.log('hhere',LSUser)

    useEffect(() => {
       // if(JSON.parse(localStorage.getItem('accessToken')) !== undefined)
        const LSToken = (localStorage.getItem('user'));
        const checkingToken = () => {
            if (LSUser === null && LSToken !== null) {

                const LSUser = JSON.parse(localStorage.getItem('user'));
                console.log('here 2',LSUser)
            }}
        

        checkingToken();
    }, [dispatch, user]);

    const checkingAuth = () => {
        if ( LSUser ) {
            console.log(user.role, allowedRoles.includes(LSUser.role))
            return allowedRoles.includes(LSUser.role);
        }
        else if (!allowedRoles.includes(LSUser?.role)) {
            console.log('not allowed role.')
            return false;
        }else logout()
    };

    const logout = () => {
        setShouldLogout(true); // Set the logout state to trigger the navigation
    };

    return shouldLogout ? (
        <Navigate to="/" />
    ) : checkingAuth() ? (
        <Outlet />
    ) : (
       <UnauthorizedPage/>
    );
}

export default RequireAuth;



function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-700 mb-6">
                    You are not authorized to view this page. Please log in with an account that has the required permissions.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
