import React, {memo, useEffect, useState} from 'react';
import clsx from 'clsx';
import {fade, makeStyles} from '@material-ui/core/styles';
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
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Collapse,
    Grow,
    Hidden,
    ListItemAvatar
} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import {useAuth} from "../../../HOCs/AuthProvider";
import {isEmpty, isLoaded} from "react-redux-firebase";
import GroupsUtil from "../../../data/util/GroupsUtil";
import {useRouter} from "next/router";
import {repositionElementInArray} from "../../../components/helperFunctions/HelperFunctions";
import NavItem from "../../../components/views/navbar/NavItem";
import {LogOut as LogoutIcon} from "react-feather";
import {useDispatch} from "react-redux";
import * as actions from "../../../store/actions";
import GroupNavLink from "./groupNavLink";
import CardMedia from "@material-ui/core/CardMedia";
import {searchImage} from "../../../constants/images";
import Typography from "@material-ui/core/Typography";
import Link from 'next/link'


const useStyles = makeStyles((theme) => ({
    mobileDrawer: {
        width: props => props.drawerWidth || 256,
    },
    desktopDrawer: {
        width: props => props.drawerWidth || 256,
        top: 64,
        height: 'calc(100% - 64px)',
        // boxShadow: theme.shadows[15]
    },
    background: {
        borderRight: "none",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        // background: `linear-gradient(0deg, ${fade(theme.palette.common.black, 0.3)}, ${fade(theme.palette.common.black, 0.3)}), url(/next-livestreams-side.jpg)`,
    },
    name: {
        marginTop: theme.spacing(1)
    },
    drawerText: {
        color: theme.palette.common.white
    },


    drawer: {
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
    media: {
        // height: 0,
        // paddingTop: '56.25%', // 16:9
        // height: 150
        display: "grid",
        placeItems: "center",
        "& img": {
            maxWidth: "60%"
        },
    },
    subheader: {
        whiteSpace: "pre-wrap"
    }
}));

const ListItemWrapper = ({active, children}) => active ? <Grow in>{children}</Grow> : <>{children}</>


const FeedDrawer = memo(({
                             onMobileNavOpen,
                             onMobileClose,
                             openMobile,
                             handleDrawerToggle,
                             drawerBottomLinks,
                             drawerTopLinks,
                             drawerWidth

                         }) => {
    const classes = useStyles({drawerWidth});
    const {query: {groupId: groupIdInQuery}} = useRouter()
    const {userData} = useAuth()
    const [groups, setGroups] = useState(null);
    const dispatch = useDispatch()
    const signOut = () => dispatch(actions.signOut())

    useEffect(() => {
        if (userData) {
            let newGroups = userData.followingGroups ? GroupsUtil.getUniqueGroupsFromArrayOfGroups(userData.followingGroups) : []
            if (groupIdInQuery) {
                const activeGroupIndex = newGroups.findIndex(
                    (el) => el.groupId === groupIdInQuery
                )
                if (activeGroupIndex > -1) {
                    newGroups = repositionElementInArray(newGroups, activeGroupIndex, 0)
                }
            }
            setGroups(newGroups)
        }

    }, [groupIdInQuery, userData?.followingGroups])


    const content = (
        <Box
            height="100%"
            display="flex"
            flexDirection="column"
        >
            <Collapse in={openMobile}>
                <Box p={2}>
                    <List>
                        {drawerTopLinks.map(({title, href, icon}) => (
                            <NavItem
                                href={href}
                                key={title}
                                title={title}
                                icon={icon}
                                black
                            />
                        ))}
                        <Divider/>
                    </List>
                </Box>
            </Collapse>

            <Box p={2}>
                {groups?.length ? (
                    <List>
                        {groups?.map(({universityName, groupId, logoUrl}) =>
                            <ListItemWrapper key={groupId} active={groupIdInQuery === groupId}>
                                <GroupNavLink
                                    key={groupId}
                                    groupId={groupId}
                                    onClick={onMobileClose}
                                    groupIdInQuery={groupIdInQuery}
                                    alt={universityName}
                                    src={logoUrl}
                                />
                            </ListItemWrapper>)}
                    </List>
                ) : (
                    <Card elevation={0}>
                        <Link href="/groups">
                            <CardActionArea component="a">
                                <CardHeader
                                    centered
                                    align="center"
                                    titleTypographyProps={{
                                        gutterBottom: true
                                    }}
                                    title="New to here?"
                                    subheaderTypographyProps={{
                                        className: classes.subheader
                                    }}
                                    subheader="Click here to discover some groups sdfs dsf sdf"
                                />
                                <CardContent>
                                    <CardMedia
                                        className={classes.media}
                                    >
                                        <img alt="Find Groups" src={searchImage}/>
                                    </CardMedia>
                                </CardContent>
                            </CardActionArea>
                        </Link>
                    </Card>
                )}
            </Box>

            <Box flexGrow={1}/>
            <Box p={2}>
                <List>
                    <Divider/>
                    {drawerBottomLinks.map((item) => (
                        <NavItem
                            href={item.href}
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                            black
                        />
                    ))}
                    {userData &&
                    <NavItem
                        href="#"
                        onClick={signOut}
                        icon={LogoutIcon}
                        title="LOGOUT"
                        black
                    />}
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
            {/*<List>*/}
            {/*    <Collapse in={!showHeaderLinks}>*/}
            {/*        <Collapse in={openMobile}>*/}
            {/*            <ListItem>*/}
            {/*                <ListItemText primary={"Nav"}/>*/}
            {/*            </ListItem>*/}
            {/*        </Collapse>*/}
            {/*        {drawerTopLinks.map(({title, href, icon}) => (*/}
            {/*            <Link className={classes.navLink} key={title} href={href}>*/}
            {/*                <ListItem button>*/}
            {/*                    <ListItemIcon>*/}
            {/*                        {icon}*/}
            {/*                    </ListItemIcon>*/}
            {/*                    <ListItemText primary={title}/>*/}
            {/*                </ListItem>*/}
            {/*            </Link>*/}
            {/*        ))}*/}
            {/*        <Divider/>*/}
            {/*    </Collapse>*/}
            {/*</List>*/}
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