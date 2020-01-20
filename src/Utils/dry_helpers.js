function isDetailed(props) {
    // Check if the current path is the detailed page
    return props.history.location.pathname.startsWith('/detailed');
}

function isOverview(props) {
    // Check if the current path is the detailed page
    return props.location.pathname === '/';
}

function isSmall(props) {
    return isDetailed(props) && props.ui.sidebarSmall;
}

export {
    isDetailed,
    isOverview,
    isSmall
}