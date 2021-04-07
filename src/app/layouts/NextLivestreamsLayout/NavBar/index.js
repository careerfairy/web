import React, {memo, useContext, useEffect, useState} from 'react';
import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {Avatar, Collapse, ListItemAvatar, Tooltip} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import {useSnackbar} from "notistack";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import {useAuth} from "../../../HOCs/AuthProvider";
import Link from '../../../materialUI/NextNavLink'
import {useSelector} from "react-redux";
import {isEmpty, isLoaded} from "react-redux-firebase";


const useStyles = makeStyles((theme) => ({
    drawerPaper: {
        [theme.breakpoints.up('sm')]: {
            paddingTop: ({scrolling}) => scrolling ? 0 : theme.mixins.toolbar["@media (min-width:600px)"].minHeight
        },
        paddingTop: ({scrolling}) => scrolling ? 0 : theme.mixins.toolbar.minHeight,
        transition: theme.transitions.create('paddingTop', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawer: {
        width: ({drawerWidth}) => drawerWidth,
        position: "absolute",
        flexShrink: 0,
        whiteSpace: 'nowrap',
        "& ::-webkit-scrollbar": {
            width: "3px",
            backgroundColor: "transparent"
        },
        "& ::-webkit-scrollbar-thumb": {
            borderRadius: "10px",
            WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,.3)",
            backgroundColor: "#555"
        },

    },
    drawerOpen: {
        width: ({drawerWidth}) => drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: ({drawerClosedWidth}) => drawerClosedWidth,
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
    listItemText: {},
    groupAvaWrapper: {
        "& img": {
            objectFit: "contain"
        }
    },
    logoButton: {
        padding: theme.spacing(1)
    },
    navLink: {
        color: "inherit"
    }

}));

const FeedDrawer = memo(({
                             onMobileNavOpen,
                             onMobileClose,
                             openMobile,
                             showHeaderLinks,
                             firebase,
                             drawerClosedWidth,
                             drawerBottomLinks,
                             drawerTopLinks

                         }) => {
    const scrolling = useScrollTrigger()
    const {enqueueSnackbar} = useSnackbar();
    const classes = useStyles({drawerWidth: 270, drawerClosedWidth, scrolling});
    const theme = useTheme();
    const [fetching, setFetching] = useState(false)

    const followingGroups = useSelector(state => state.firestore.ordered["followingGroups"])

    const renderGroups = followingGroups?.map(({universityName, groupId, logoUrl}, index) => {
        return (
            <ListItem className={classes.logoButton} button key={groupId}>
                <ListItemAvatar>
                    <Avatar className={classes.groupAvaWrapper} alt={universityName} variant="rounded" src={logoUrl}/>
                </ListItemAvatar>
                <Tooltip title={universityName}>
                    <ListItemText
                        primary={universityName}
                        primaryTypographyProps={{className: classes.listItemText, noWrap: true}}
                    >
                    </ListItemText>
                </Tooltip>
            </ListItem>
        )
    })


    return (
        <Drawer
            onMouseEnter={onMobileNavOpen}
            onMouseLeave={onMobileClose}
            variant="permanent"
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: openMobile,
                [classes.drawerClose]: !openMobile,
            })}
            classes={{
                paper: clsx(classes.drawerPaper, {
                    [classes.drawerOpen]: openMobile,
                    [classes.drawerClose]: !openMobile,
                }),
            }}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={onMobileClose}>
                    {openMobile ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                </IconButton>
            </div>
            <Divider/>
            <List>
                <Collapse in={!showHeaderLinks}>
                    <Collapse in={openMobile}>
                        <ListItem>
                            <ListItemText primary={"Nav"}/>
                        </ListItem>
                    </Collapse>
                    {drawerTopLinks.map(({title, href, icon}) => (
                        <Link className={classes.navLink} key={title} href={href}>
                            <ListItem button>
                                <ListItemIcon>
                                    {icon}
                                </ListItemIcon>
                                <ListItemText primary={title}/>
                            </ListItem>
                        </Link>
                    ))}
                    <Divider/>
                </Collapse>
                {!isLoaded(followingGroups) ? <ListSpinner/> : isEmpty(followingGroups) ? <div/> : renderGroups}
            </List>
            <Divider/>
            <List>
                <Collapse in={openMobile}>
                    <ListItem>
                        <ListItemText primary={"Recommended"}/>
                    </ListItem>
                </Collapse>
                {drawerBottomLinks.map(({title}, index) => (
                    <ListItem button key={title}>
                        <ListItemIcon>{index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}</ListItemIcon>
                        <ListItemText primary={title}/>
                    </ListItem>
                ))}
            </List>

        </Drawer>
    )
})

const ListSpinner = () => {

    return (
        <ListItem>
            <ListItemAvatar>
                <CircularProgress size={20}/>
            </ListItemAvatar>
        </ListItem>
    )
}

export default FeedDrawer