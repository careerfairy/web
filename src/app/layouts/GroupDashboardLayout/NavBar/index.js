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
    makeStyles
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
    Edit as EditGroupIcon
} from 'react-feather';
import NavItem from './NavItem';
import {useRouter} from "next/router";

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
        height: 'calc(100% - 64px)'
    },
    avatar: {
        cursor: 'pointer',
        height: 100,
        width: '100%',
        "& img": {
            objectFit: "contain"
        }
    },
    // image:{
    // }
}));

const NavBar = ({onMobileClose, openMobile, group}) => {
    const classes = useStyles();
    const {pathname} = useRouter()
    useEffect(() => {
        if (openMobile && onMobileClose) {
            onMobileClose();
        }
    }, [pathname]);

    const items = [
        {
            href: `/group/${group.id}/admin/upcoming-livestreams`,
            icon: StreamIcon,
            title: 'Upcoming Streams'
        },
        {
            href: `/group/${group.id}/admin/past-livestreams`,
            icon: PastStreamIcon,
            title: 'Past Streams'
        },
        {
            href: `/group/${group.id}/admin/drafts`,
            icon: DraftStreamIcon,
            title: 'Manage and Approve Drafts'
        },
        {
            href: `/group/${group.id}/admin/edit`,
            icon: EditGroupIcon,
            title: 'Edit Group Profile'
        },
        {
            href: `/group/${group.id}/admin/settings`,
            icon: SettingsIcon,
            title: 'Settings'
        }
    ];

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
                    variant="square"
                    href="/app/account"
                />
                <Typography
                    className={classes.name}
                    color="textPrimary"
                    variant="h5"
                >
                    {group.universityName}
                </Typography>
                <Typography
                    color="textSecondary"
                    variant="body2"
                >
                    {group.description}
                </Typography>
            </Box>
            <Divider/>
            <Box p={2}>
                <List>
                    {items.map((item) => (
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
        </Box>
    );

    return (
        <>
            <Hidden lgUp>
                <Drawer
                    anchor="left"
                    classes={{paper: classes.mobileDrawer}}
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
                    classes={{paper: classes.desktopDrawer}}
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
