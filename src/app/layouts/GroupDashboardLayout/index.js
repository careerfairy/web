import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Head from "next/head";
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
import {isEmptyObject} from "../../components/helperFunctions/HelperFunctions";
import {useAuth} from "../../HOCs/AuthProvider";
import {
    Archive as PastStreamIcon,
    Edit as EditGroupIcon,
    FileText as DraftStreamIcon,
    Film as StreamIcon,
    Settings as SettingsIcon,
    User as ProfileIcon
} from "react-feather";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        width: '100%'
    },
    wrapper: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        [theme.breakpoints.up('lg')]: {
            paddingLeft: 256
        },
        [theme.breakpoints.down('md')]: {
            paddingTop: 56
        }
    },
    contentContainer: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
    },
    content: {
        flex: '1 1 auto',
        height: '100%',
        overflow: 'auto'
    }
}));

const GroupDashboardLayout = (props) => {
    const {children, firebase} = props
    const classes = useStyles();
    const {query: {groupId, careerCenterId}, replace, pathname} = useRouter()
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const [group, setGroup] = useState({});
    const {userData, authenticatedUser} = useAuth()

    useEffect(() => {
        if (groupId || careerCenterId) {
            const targetGroupId = groupId || careerCenterId
            const unsubscribe = firebase.listenToCareerCenterById(
                targetGroupId,
                (querySnapshot) => {
                    let careerCenter = querySnapshot.data();
                    careerCenter.id = querySnapshot.id;
                    setGroup(careerCenter);
                }
            );
            return () => unsubscribe();
        }
    }, [groupId, careerCenterId]);

    useEffect(() => {
        if (unAuthorized()) {
            replace("/");
        }
    }, [group, authenticatedUser, userData]);

    const unAuthorized = () => {
        return Boolean(
            (!isEmptyObject(group) && authenticatedUser && userData)
            && (authenticatedUser.email !== group.adminEmail) && !userData.isAdmin
        )
    }


    const headerLinks = [
        {
            href: `/next-livestreams`,
            title: 'NEXT LIVE STREAMS'
        },
        {
            href: `/discover`,
            title: 'PAST LIVE STREAMS'
        },
        {
            href: `/wishlist`,
            title: 'WISHLIST'
        }
    ]

    const drawerBottomLinks = [
        {
            href: `https://corporate.careerfairy.io/companies`,
            title: 'FOR COMPANIES'
        },
        {
            href: `https://corporate.careerfairy.io/career-center`,
            title: 'FOR CAREER CENTERS'
        }
    ]

    const drawerTopLinks = [
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

    if (authenticatedUser?.emailVerified) {
        headerLinks.push({
            href: `/groups`,
            title: 'FOLLOW GROUPS'
        })
        drawerBottomLinks.push({
            href: `/profile`,
            title: 'PROFILE',
            icon: ProfileIcon
        })
    }

    return (
        <div className={classes.root}>
            <TopBar
                links={headerLinks}
                onMobileNavOpen={() => setMobileNavOpen(true)}
            />
            <NavBar
                firebase={firebase}
                drawerTopLinks={drawerTopLinks}
                drawerBottomLinks={drawerBottomLinks}
                headerLinks={headerLinks}
                group={group}
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
            />
            <div className={classes.wrapper}>
                <div className={classes.contentContainer}>
                    <div className={classes.content}>
                        {!isEmptyObject(group) && React.cloneElement(children, {group, ...props})}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withFirebase(GroupDashboardLayout);
