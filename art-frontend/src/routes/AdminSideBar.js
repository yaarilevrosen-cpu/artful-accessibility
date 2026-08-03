
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon'
import  QuestionMarkCircleIcon  from '@heroicons/react/24/outline/QuestionMarkCircleIcon'; // Import Help Icon
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import HomeIcon  from '@heroicons/react/24/outline/HomeIcon';
import VideoCameraIcon from '@heroicons/react/24/outline/VideoCameraIcon';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

const iconClasses = `h-6 w-6`
const submenuIconClasses = `h-5 w-5`
// `name` holds a translation key, not literal text - the sidebar lives
// outside any component (module-level array), so it can't call
// useTranslation() itself; LeftSidebar/SidebarSubmenu look the key up.
const AdminSidebar = [

  {    path: '/admin/Welcome', // url
  icon: <HomeIcon className={iconClasses}/>, // icon component
  name: 'sidebar.welcome',
  },
  {
    path: '/admin/Paintings', // url
    icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
    name: 'sidebar.managePaintings',
  },

  {
   path: '/admin/charts', // url
   icon: <ChartBarIcon className={iconClasses}/>, // icon component
   name: 'sidebar.analytics',
   submenu : [
      {
          path: '/admin/Livecharts',
          icon: <PresentationChartLineIcon  className={submenuIconClasses}/>,
          name: 'sidebar.liveCharts',
        },
      {
        path: '/admin/history',
        icon: <ArchiveBoxIcon className={submenuIconClasses}/>,
        name: 'sidebar.history',
      },
    ]
   },
   {
    path: '/admin/LiveDetection', // url
    icon: <VideoCameraIcon className={iconClasses}/>, // icon component
    name: 'sidebar.liveDetection',
   },
   {    path: '/admin/HelpAdmin', // url
    icon: <QuestionMarkCircleIcon className={iconClasses} />, // icon component
    name: 'sidebar.help',
    },
]


    export default AdminSidebar