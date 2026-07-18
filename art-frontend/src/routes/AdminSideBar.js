
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon'
import  QuestionMarkCircleIcon  from '@heroicons/react/24/outline/QuestionMarkCircleIcon'; // Import Help Icon
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import HomeIcon  from '@heroicons/react/24/outline/HomeIcon';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`
const AdminSidebar = [
 
  {    path: '/admin/Welcome', // url
  icon: <HomeIcon className={iconClasses}/>, // icon component
  name: 'Welcome', // name that appear in Sidebar
  },
  {
    path: '/admin/Paintings', // url
    icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
    name: 'Manage Paintings', // name that appear in Sidebar
  },
  
  {
   path: '/admin/charts', // url
   icon: <ChartBarIcon className={iconClasses}/>, // icon component
   name: 'Analytics', // name that appear in Sidebar
   submenu : [ 
      {
          path: '/admin/Livecharts',
          icon: <PresentationChartLineIcon  className={submenuIconClasses}/>,
          name: 'Live Charts',
        },
      {
        path: '/admin/history',
        icon: <ArchiveBoxIcon className={submenuIconClasses}/>,
        name: 'History',
      },   
    ]
   },
   {    path: '/admin/HelpAdmin', // url
    icon: <QuestionMarkCircleIcon className={iconClasses} />, // icon component
    name: 'Help', // name that appear in Sidebar
    },
]


    export default AdminSidebar