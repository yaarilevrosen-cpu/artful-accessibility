
import  QuestionMarkCircleIcon  from '@heroicons/react/24/outline/QuestionMarkCircleIcon'; // Import Help Icon
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import HomeIcon  from '@heroicons/react/24/outline/HomeIcon';

const iconClasses = `h-6 w-6`

const WorkerSidebar = [
 
  {    path: '/worker/WelcomeW', // url
  icon: <HomeIcon className={iconClasses}/>, // icon component
  name: 'Welcome', // name that appear in Sidebar
  },
  {
    path: '/worker/Paintings', // url
    icon: <InboxArrowDownIcon className={iconClasses}/>, // icon component
    name: 'Manage Paintings', // name that appear in Sidebar
  },
  

   {    path: '/worker/HelpWorker', // url
    icon: <QuestionMarkCircleIcon className={iconClasses} />, // icon component
    name: 'Help', // name that appear in Sidebar
    },
]


    export default WorkerSidebar