import React, {useCallback, useContext, useEffect, useState} from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme, fade} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import {withFirebase} from "../../../context/firebase";
import {Button, useMediaQuery} from "@material-ui/core";
import Zoom from '@material-ui/core/Zoom';
import Box from "@material-ui/core/Box";
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import ContactsIcon from '@material-ui/icons/Contacts';
import {useRouter} from "next/router";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import HideOnScroll from "../../../materialUI/Misc";
import {useAuth} from "../../../HOCs/AuthProvider";

const useStyles = makeStyles((theme) => ({

    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        background: theme.palette.navyBlue.main
    },
    appBarShift: {
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    navbarDisplayFlex: {
        display: `flex`,
        justifyContent: `space-between`
    },
    linkText: {
        textDecoration: `none`,
        textTransform: `uppercase`,
        color: `white`
    },
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
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
    careerFairyWrapper: {
        minWidth: 80
    }
}));


const TopBar = ({firebase, handleChange, searchParams, handleSubmitSearch, drawerClosedWidth}) => {
    const theme = useTheme()
    const showHeaderLinks = useMediaQuery(theme.breakpoints.up('md'))
    const classes = useStyles();
    const {userData, setUserData} = useAuth()
    const [value, setValue] = useState(0)
    const [open, setOpen] = useState(false);
    const {push, pathname, query: {careerCenterId}} = useRouter()

    const navLinks = [
        {
            title: `NEXT LIVE STREAMS`,
            path: `/next-livestreams`,
            icon: <ContactsIcon color={pathname === "/next-livestreams" ? "primary" : "default"}/>
        },
        {title: `PAST LIVE STREAMS`, path: `/discover`, icon: <VideoLibraryIcon/>},
        // {title: `WISHLIST`, path: `/wishlist`, icon: <WbSunnyIcon/>},
        {title: `FOLLOW GROUPS`, path: `/groups`, icon: <GroupAddIcon/>},
    ];

    useEffect(() => {
        if (pathname && navLinks) {
            const newValue = navLinks.findIndex(linkObj => linkObj.path === pathname)
            if (newValue > -1) {
                setValue(newValue)
            }
        }
    }, [pathname])


    const handleDrawerOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setOpen(false);
    }, []);

    const renderNavLinks = navLinks.map(({title, path, icon}) => (
        <Tab key={title} href={path} label={title}/>
    ))


    return (
        <HideOnScroll>
            <AppBar
                position="sticky"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar className={classes.navbarDisplayFlex}>
                    <Box className={classes.careerFairyWrapper} display="flex" alignItems="center">
                        <Typography variant="h6" noWrap>
                            {showHeaderLinks ? "CareerFairy" : "CF"}
                        </Typography>
                    </Box>
                    <Zoom unmountOnExit in={showHeaderLinks}>
                        <Tabs indicatorColor="primary" value={value} aria-label="navigation links">
                            {renderNavLinks}
                        </Tabs>
                    </Zoom>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon/>
                        </div>
                        <form onSubmit={handleSubmitSearch}>
                            <InputBase
                                onChange={handleChange}
                                value={searchParams}
                                placeholder="Search…"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{'aria-label': 'search'}}
                            />
                        </form>
                    </div>
                    {showHeaderLinks ?
                        <Button href={"/profile"} variant="contained" color="primary">Profile</Button>
                        :
                        <IconButton color="inherit" href={"/profile"}>
                            <AccountCircleIcon/>
                        </IconButton>}
                </Toolbar>
            </AppBar>
        </HideOnScroll>
    )
}
export default withFirebase(TopBar);
