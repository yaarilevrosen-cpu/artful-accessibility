function NotificationBodyRightDrawer(){
    // The notification bell that would open this drawer is currently
    // commented out in Header.js, so this never actually mounts today - but
    // a function component returning undefined (no return statement at all)
    // throws as soon as something does render it. Return null so re-enabling
    // the bell later doesn't immediately crash.
    return null;
}

export default NotificationBodyRightDrawer