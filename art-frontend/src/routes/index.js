// All components mapping with path for internal routes

import { lazy } from 'react'
const Login = lazy(() => import('../pages/Login'))
const Charts = lazy(() => import('../pages/protected/Charts'))
const Leads = lazy(() => import('../pages/protected/Leads'))
const Welcome = lazy(() => import('../pages/protected/Welcome'))
const WelcomeW = lazy(() => import('../pages/protected/WelcomeW'))
const HelpAdmin = lazy(() => import('../pages/protected/HelpAdmin'))
const HelpWorker = lazy(() => import('../pages/protected/HelpWorker'))
const History=lazy(() => import('../pages/protected/history'))

const routes = [
 
    // Admin routes
    {
      path: '/welcome',
      component: Welcome,
    },
    {
      path: '/Paintings',
      component: Leads,
    },
    {
      path: '/Livecharts',
      component: Charts,
    },
    {
      path: '/HelpAdmin',
      component: HelpAdmin,
    },
    {
      path: '/History',
      component: History,
    },
   
    // Worker routes
    {
      path: '/welcomew',
      component: WelcomeW,
    },

    {
      path: '/HelpWorker',
      component: HelpWorker,
    },
   
    
  
    // Common route
    {
      path: '/login',
      component: Login,
    },
  
  ];
  

  
 

export default routes
