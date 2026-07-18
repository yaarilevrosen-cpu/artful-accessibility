import './App.css';
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import initializeApp from './app/init';
import RequireAuth from './auth/RequireAuth';
import MyComponent from "./utils/MyComponent";
// Importing pages
const Layout = lazy(() => import('./containers/Layout'));
const Login = lazy(() => import('./pages/Login'));


// Initialize libraries
initializeApp();

// Retrieve token and role
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

console.log("token:",token);
const role = localStorage.getItem("role");

function App() {
  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <>
      <Router>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/web" element={<MyComponent />} />



          <Route element={<RequireAuth allowedRoles={['admin']}/> } >
            <Route path="/admin/*" element={<Layout />} />
          </Route>


          <Route element={<RequireAuth allowedRoles={['worker']}/> } >
            {/* Place new routes over this */}
            <Route path="/worker/*" element={<Layout />} />


          </Route>

        </Routes>

      </Router>
    </>
  );
}

export default App;
