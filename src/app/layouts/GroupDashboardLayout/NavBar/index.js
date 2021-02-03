import React, {useEffect} from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import {
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    Hidden,
    List,
    Typography,
    makeStyles, ListItem, ListItemText, ListItemIcon
} from '@material-ui/core';
import {
    AlertCircle as AlertCircleIcon,
    BarChart as BarChartIcon,
    Lock as LockIcon,
    Settings as SettingsIcon,
    ShoppingBag as ShoppingBagIcon,
    User as UserIcon,
    UserPlus as UserPlusIcon,
    Users as UsersIcon,
    Film as StreamIcon,
    Archive as PastStreamIcon,
    FileText as DraftStreamIcon,
    Edit as EditGroupIcon,
    LogOut as LogoutIcon
} from 'react-feather';
import NavItem from './NavItem';
import {useRouter} from "next/router";
import {theme} from "../../../materialUI";
import {fade} from "@material-ui/core/styles";
import clsx from "clsx";

const user = {
    avatar: '/static/images/avatars/avatar_6.png',
    jobTitle: 'Senior Developer',
    name: 'Katarina Smith'
};


const useStyles = makeStyles(() => ({
    mobileDrawer: {
        width: 256
    },
    desktopDrawer: {
        width: 256,
        top: 64,
        height: 'calc(100% - 64px)',
    },
    avatar: {
        padding: theme.spacing(1),
        cursor: 'pointer',
        background: theme.palette.common.white,
        height: 100,
        width: '100%',
        boxShadow: theme.shadows[15],
        "& img": {
            objectFit: "contain"
        }
    },
    background: {
        "&:after": {
            position: "absolute",
            width: "100%",
            height: "100%",
            content: '""',
            display: "block",
            background: fade(theme.palette.common.black, 0.8),
            opacity: ".8",
            zIndex: -1,
        },
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundImage: `url(/sidebar.jpg)`
    },
    name: {
        marginTop: theme.spacing(1)
    },
    drawerText: {
        color: theme.palette.common.white
    },


}));

const NavBar = ({onMobileClose, openMobile, group, drawerTopLinks, headerLinks, drawerBottomLinks, firebase}) => {
    const classes = useStyles();
    const {pathname} = useRouter()
    useEffect(() => {
        if (openMobile && onMobileClose) {
            onMobileClose();
        }
    }, [pathname]);

    const signOut = () => {
        firebase.doSignOut()
    }


    const content = (
        <Box
            height="100%"
            display="flex"
            flexDirection="column"
        >
            <Box
                alignItems="center"
                display="flex"
                flexDirection="column"
                p={2}
            >
                <Avatar
                    className={classes.avatar}
                    src={group.logoUrl}
                    variant="rounded"
                />
                <Typography
                    className={clsx(classes.name, classes.drawerText)}
                    color="textPrimary"
                    variant="h5"
                >
                    {group.universityName}
                </Typography>
                <Typography
                    color="textSecondary"
                    variant="body2"
                    className={classes.drawerText}
                >
                    {group.description}
                </Typography>
            </Box>
            <Divider/>
            <Box p={2}>
                <List>
                    {drawerTopLinks.map((item) => (
                        <NavItem
                            href={item.href}
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                        />
                    ))}
                </List>
            </Box>
            <Box flexGrow={1}/>
            <Box p={2}>
                <List>
                    <Hidden lgUp>
                        {headerLinks.map((item) => (
                            <NavItem
                                href={item.href}
                                key={item.title}
                                title={item.title}
                            />
                        ))}
                    </Hidden>
                    {drawerBottomLinks.map((item) => (
                        <NavItem
                            href={item.href}
                            key={item.title}
                            title={item.title}
                            icon={item.icon}
                        />
                    ))}
                    <NavItem
                        href=""
                        onClick={signOut}
                        icon={LogoutIcon}
                        title="LOGOUT"
                    />
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
};

NavBar.propTypes = {
    onMobileClose: PropTypes.func,
    openMobile: PropTypes.bool
};

NavBar.defaultProps = {
    onMobileClose: () => {
    },
    openMobile: false
};

export default NavBar;
