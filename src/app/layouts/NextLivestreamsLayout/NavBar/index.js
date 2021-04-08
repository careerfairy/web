import React, {memo, useContext, useEffect, useState} from 'react';
import clsx from 'clsx';
import {fade, makeStyles, useTheme} from '@material-ui/core/styles';
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
import {Avatar, Box, Collapse, Hidden, ListItemAvatar, Tooltip} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import {useSnackbar} from "notistack";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import {useAuth} from "../../../HOCs/AuthProvider";
import Link from '../../../materialUI/NextNavLink'
import {useSelector} from "react-redux";
import {isEmpty, isLoaded} from "react-redux-firebase";
import GroupsUtil from "../../../data/util/GroupsUtil";
import NavItem from "../../../components/views/navbar/NavItem";
import {LogOut as LogoutIcon} from "react-feather";


const useStyles = makeStyles((theme) => ({
    mobileDrawer: {
        width: props => props.drawerWidth ||256,
    },
    desktopDrawer: {
        width: props => props.drawerWidth ||256,
        top: 64,
        height: 'calc(100% - 64px)',
        boxShadow: theme.shadows[15]
    },
    background: {
        borderRight: "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        // background: `linear-gradient(0deg, ${fade(theme.palette.common.black, 0.7)}, ${fade(theme.palette.common.black, 0.7)}), url(/sidebar.jpg)`,
    },
    name: {
        marginTop: theme.spacing(1)
    },
    drawerText: {
        color: theme.palette.common.white
    },

}));

const FeedDrawer = memo(({
                             onMobileNavOpen,
                             onMobileClose,
                             openMobile,
                             showHeaderLinks,
                             firebase,
                             handleDrawerToggle,
                             drawerBottomLinks,
                             drawerTopLinks,
                             drawerWidth

                         }) => {
    const scrolling = useScrollTrigger()
    const classes = useStyles({drawerWidth});

    const {userData} = useAuth()


    const content = (
        <Box
            height="100%"
            display="flex"
            flexDirection="column"
        >
            <Box p={2}>
                <List>
                    {GroupsUtil.getUniqueGroupsFromArrayOfGroups(userData?.followingGroups).map(({universityName, groupId, logoUrl}, index) => {
                        return (
                            <ListItem component={Link} className={classes.logoButton} href={`/next-livestreams/${groupId}`} button key={groupId}>
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
                    })}
                </List>
            </Box>
            <Box flexGrow={1}/>
            <Box p={2}>
                <List>
                    {/*<Hidden lgUp>*/}
                    {/*    {headerLinks.map((item) => (*/}
                    {/*        <NavItem*/}
                    {/*            href={item.href}*/}
                    {/*            key={item.title}*/}
                    {/*            title={item.title}*/}
                    {/*        />*/}
                    {/*    ))}*/}
                    {/*</Hidden>*/}
                    {drawerBottomLinks.map(({title}, index) => (
                        <ListItem button key={title}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}</ListItemIcon>
                            <ListItemText primary={title}/>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );

    return (
        <>
            <Hidden lgUp>
                <Drawer
                    anchor="left"
                    classes={{paper: clsx(classes.mobileDrawer, classes.background)}}
                    className={classes.drawer}
                    onClose={onMobileClose}
                    open={openMobile}
                    variant="temporary"
                >
                    {content}
                </Drawer>
            </Hidden>
            <Hidden mdDown>
                <Drawer
                    anchor="left"
                    classes={{paper: clsx(classes.desktopDrawer, classes.background)}}
                    className={classes.drawer}
                    open
                    variant="persistent"
                >
                    {content}
                </Drawer>
            </Hidden>
        </>
    );


    return (
        <Drawer
            // onMouseEnter={onMobileNavOpen}
            // onMouseLeave={onMobileClose}
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
                <IconButton onClick={handleDrawerToggle}>
                    {openMobile ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                </IconButton>
            </div>
            <Divider/>
            <List>
                {/*<Collapse in={!showHeaderLinks}>*/}
                {/*    <Collapse in={openMobile}>*/}
                {/*        <ListItem>*/}
                {/*            <ListItemText primary={"Nav"}/>*/}
                {/*        </ListItem>*/}
                {/*    </Collapse>*/}
                {/*    {drawerTopLinks.map(({title, href, icon}) => (*/}
                {/*        <Link className={classes.navLink} key={title} href={href}>*/}
                {/*            <ListItem button>*/}
                {/*                <ListItemIcon>*/}
                {/*                    {icon}*/}
                {/*                </ListItemIcon>*/}
                {/*                <ListItemText primary={title}/>*/}
                {/*            </ListItem>*/}
                {/*        </Link>*/}
                {/*    ))}*/}
                {/*    <Divider/>*/}
                {/*</Collapse>*/}
                {!isLoaded(userData?.followingGroups) ? <ListSpinner/> : isEmpty(userData?.followingGroups) ? <div/> : renderGroups}
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