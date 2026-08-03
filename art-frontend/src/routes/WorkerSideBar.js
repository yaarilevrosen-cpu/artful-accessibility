
import  QuestionMarkCircleIcon  from '@heroicons/react/24/outline/QuestionMarkCircleIcon'; // Import Help Icon
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import HomeIcon  from '@heroicons/react/24/outline/HomeIcon';

const iconClasses = `h-6 w-6`

// `name` holds a translation key, not literal text - see AdminSideBar.js.
const WorkerSidebar = [

  {    path: '/worker/WelcomeW', // url
  icon: <HomeIcon className={iconClasses}/>, // icon component
  name: 'sidebar.welcome',
  },
  {
    path: '/worker/Paintings', // url
    icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
    name: 'sidebar.managePaintings',
  },


   {    path: '/worker/HelpWorker', // url
    icon: <QuestionMarkCircleIcon className={iconClasses} />, // icon component
    name: 'sidebar.help',
    },
]


    export default WorkerSidebar