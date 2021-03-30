const topBarStyles = (theme) => ({
    avatar: {
        width: 60,
        height: 60
    },
    navIconButton: {
        color: "white !important"
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    navLinks: {
        fontWeight: 600,
        opacity: 1,
        color: `${theme.palette.primary.contrastText} !important`,
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 4,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "hidden",
            WebkitTransform: "scaleX(0)",
            transform: "scaleX(0)",
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.complex,
            }),
        },
        "&:hover:before": {
            visibility: "visible",
            WebkitTransform: "scaleX(1)",
            transform: "scaleX(1)"
        }
    },
    indicator: {
        background: theme.palette.common.white,
        color: theme.palette.common.white
    },
    root: {
        // Ensures top bar's Zindex is always above the drawer
        zIndex: theme.zIndex.drawer + 1
    }
})

export default topBarStyles