// English translations. Flat key -> string map. Keys are namespaced by
// screen/component (e.g. "header.logout") purely for readability - there is
// no nesting at runtime. Every key here must also exist in he.js; the
// completeness check in LanguageContext.js warns loudly in development if
// the two ever drift apart.
const en = {
  // --- Common / shared across screens ---
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.save": "Save",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.deleting": "Deleting...",
  "common.info": "Info",
  "common.close": "Close",
  "common.loading": "Loading...",
  "common.yes": "Yes",
  "common.na": "N/A",
  "common.seconds": "seconds",
  "common.active": "Active",
  "common.inactive": "Inactive",
  "common.on": "On",
  "common.off": "Off",

  // --- Language names (invariant - each names itself in its own script) ---
  "language.en": "English",
  "language.he": "עברית",

  // --- Header ---
  "header.toggleLanguageAria": "Switch language",
  "header.toggleThemeAria": "Toggle dark mode",
  "header.helloUser": "Hello, {username}",
  "header.logout": "Logout",

  // --- Sidebar ---
  "sidebar.logoAlt": "Hecht Museum logo",
  "sidebar.museumName": "The Hecht Museum",
  "sidebar.welcome": "Welcome",
  "sidebar.managePaintings": "Manage Paintings",
  "sidebar.analytics": "Analytics",
  "sidebar.liveCharts": "Live Charts",
  "sidebar.history": "History",
  "sidebar.liveDetection": "Live Detection",
  "sidebar.help": "Help",

  // --- Login page ---
  "login.welcome": "Welcome",
  "login.systemName": "To the Hecht Museum Management System",
  "login.title": "Login",
  "login.usernameLabel": "Username",
  "login.passwordLabel": "Password",
  "login.submit": "Login",
  "login.loggingIn": "Logging in...",
  "login.usernameRequired": "Username is required!",
  "login.passwordRequired": "Password is required!",
  "login.genericError": "Something went wrong. Please try again.",
  "login.pointer.autoHeight": "Paintings automatically lower to eye level for visitors using wheelchairs",
  "login.pointer.liveMonitoring": "Live camera monitoring keeps every painting's status visible in real time",
  "login.pointer.analytics": "Built-in analytics track engagement and viewing history for every artwork",

  // --- Welcome (admin) ---
  "welcomeAdmin.title": "Welcome Admin",
  "welcomeAdmin.aboutTitle": "About the System",
  "welcomeAdmin.aboutBody": "The Hecht Museum Management System is designed to help staff efficiently manage paintings integrated into the automated height adjustment system. It also provides a detailed analysis of system performance and visitor interaction data, making museum operations smoother and more insightful.",
  "welcomeAdmin.toolsTitle": "Your Admin Tools",
  "welcomeAdmin.tool.add.label": "Add New Paintings:",
  "welcomeAdmin.tool.add.body": "Easily integrate new artworks into the automated adjustment system.",
  "welcomeAdmin.tool.edit.label": "Edit Artwork Details:",
  "welcomeAdmin.tool.edit.body": "Update information such as dimensions and system status (Active/Inactive).",
  "welcomeAdmin.tool.delete.label": "Delete Paintings:",
  "welcomeAdmin.tool.delete.body": "Remove artworks no longer in use.",
  "welcomeAdmin.tool.analytics.label": "View Analytics:",
  "welcomeAdmin.tool.analytics.body": "Real-time data on painting views, visitor engagement, and trends. Includes:",
  "welcomeAdmin.tool.analytics.live": "Live statistics on current artworks.",
  "welcomeAdmin.tool.analytics.history": "Historical data for deleted artworks.",
  "welcomeAdmin.tool.tracking.label": "System Tracking:",
  "welcomeAdmin.tool.tracking.body": "View the System Status Panel under each painting in real time to monitor:",
  "welcomeAdmin.tool.tracking.system.label": "System Status:",
  "welcomeAdmin.tool.tracking.system.body": "Shows if the system is working properly.",
  "welcomeAdmin.tool.tracking.sensor.label": "Sensor Activity:",
  "welcomeAdmin.tool.tracking.sensor.body": "Detects if a person is near the painting.",
  "welcomeAdmin.tool.tracking.wheelchair.label": "Wheelchair Detection:",
  "welcomeAdmin.tool.tracking.wheelchair.body": "Detects people in wheelchairs for height adjustments.",
  "welcomeAdmin.tool.tracking.height.label": "Height Adjustment:",
  "welcomeAdmin.tool.tracking.height.body": "Shows if the painting's height is being adjusted.",
  "welcomeAdmin.tool.export.label": "Export Reports:",
  "welcomeAdmin.tool.export.body": "Download detailed CSV reports for offline analysis.",
  "welcomeAdmin.tool.dateFilter.label": "Custom Date Filters:",
  "welcomeAdmin.tool.dateFilter.body": "Analyze data within specific periods to uncover meaningful insights.",
  "welcomeAdmin.tool.enlarge.label": "Enlarge Artwork Photos:",
  "welcomeAdmin.tool.enlarge.body": "Open a detailed view of any painting by clicking on its image.",
  "welcomeAdmin.helpTitle": "Need Help?",
  "welcomeAdmin.helpBody": "Access the Help section for a step-by-step guide on system usage, including:",
  "welcomeAdmin.helpItem.manage": "Adding, Editing, or Deleting paintings.",
  "welcomeAdmin.helpItem.reports": "How to access and interpret analysis reports.",
  "welcomeAdmin.helpItem.tracking": "System Tracking",
  "welcomeAdmin.callToAction": "\"Manage and analyze effortlessly. Click on a section to get started!\"",

  // --- Welcome (worker) ---
  "welcomeWorker.title": "Welcome Worker",
  "welcomeWorker.aboutTitle": "About the System",
  "welcomeWorker.aboutBody": "The Hecht Museum Management System is designed to help staff efficiently manage paintings integrated into the automated height adjustment system.",
  "welcomeWorker.toolsTitle": "Your Worker Tools",
  "welcomeWorker.helpItem.manage": "Adding, Editing, or Deleting paintings.",
  "welcomeWorker.callToAction": "\"Manage effortlessly. Click on a section to get started!\"",

  // --- 404 / Blank ---
  "notFound.title": "404 - Not Found",
  "blank.pageTitle": "Page Title",
  "blank.heading": "Blank Page",
};

export default en;
