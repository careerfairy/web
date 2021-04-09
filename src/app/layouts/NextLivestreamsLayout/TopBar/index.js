import React from 'react';
import clsx from 'clsx';
import {fade, makeStyles, useTheme} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import {withFirebase} from "../../../context/firebase";
import {Hidden, useMediaQuery} from "@material-ui/core";
import Zoom from '@material-ui/core/Zoom';
import Box from "@material-ui/core/Box";
import {useRouter} from "next/router";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {MainLogo, MiniLogo} from "../../../components/logos";
import Link from "../../../materialUI/NextNavLink";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({

    toolbar: {
        display: "flex",
        justifyContent: "space-between"
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    root: {
        flexGrow: 1,
        background: theme.palette.navyBlue.main,
        zIndex: 1201
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },

        marginRight: theme.spacing(1),

        [theme.breakpoints.down('sm')]: {
            marginLeft: "auto",
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '17ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
    navLinks: {
        fontWeight: 600,
        opacity: 1,
        color: `${theme.palette.primary.contrastText} !important`,
        "&:hover": {
            textDecoration: "none !important",
        },
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 0,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "hidden",
            WebkitTransform: "scaleX(0)",
            transform: "scaleX(0)",
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
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
    navIconButton: {
        color: "white !important"
    },
    active: {
        "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: 2,
            bottom: 0,
            left: "0",
            backgroundColor: theme.palette.common.white,
            visibility: "visible",
            WebkitTransform: "scaleX(1)",
            transform: "scaleX(1)"
        },
    }
}));


const TopBar = ({
                    links,
                    className,
                    onMobileNavOpen,
                }) => {

    const theme = useTheme()
    const showHeaderLinks = useMediaQuery(theme.breakpoints.up('md'))
    const classes = useStyles();
    const {pathname} = useRouter()

    return (
        <AppBar elevation={1} className={clsx(classes.root, className)}>
            <Toolbar className={classes.toolbar}>
                <Hidden smDown>
                    <MainLogo white/>
                </Hidden>
                <Hidden mdUp>
                    <MiniLogo/>
                </Hidden>

                <Hidden mdDown>
                    <Zoom unmountOnExit in={showHeaderLinks}>
                        <Tabs value={false} classes={{indicator: classes.indicator}}>
                            {links
                                .map((item) => {
                                    return (
                                        <Tab
                                            key={item.title}
                                            component={Link}
                                            className={clsx(classes.navLinks, {
                                                [classes.active]: pathname === item.href
                                            })}
                                            label={item.title}
                                            href={item.href}
                                        />
                                    )
                                })}
                        </Tabs>
                    </Zoom>
                </Hidden>
                <Box>
                    <Hidden mdDown>
                        <IconButton
                            component={Link}
                            className={classes.navIconButton}
                            href="/profile"
                        >
                            <AccountCircleOutlinedIcon/>
                        </IconButton>
                    </Hidden>
                    <Hidden lgUp>
                        <IconButton color="inherit" onClick={onMobileNavOpen}>
                            <MenuIcon/>
                        </IconButton>
                    </Hidden>
                </Box>
            </Toolbar>
        </AppBar>
    )
}
export default withFirebase(TopBar);
