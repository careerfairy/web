import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import TopBar from './TopBar';
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
import {isEmptyObject} from "../../components/helperFunctions/HelperFunctions";
import {useAuth} from "../../HOCs/AuthProvider";
import {
    Archive as PastStreamIcon,
    BarChart2 as AnalyticsIcon,
    Edit as EditGroupIcon,
    FileText as DraftStreamIcon,
    Film as StreamIcon,
    User as ProfileIcon,
    Users as RolesIcon
} from "react-feather";
import {useFirestoreConnect, populate} from "react-redux-firebase";
import {useSelector} from "react-redux";


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
        [theme.breakpoints.down('xs')]: {
            paddingTop: 56
        },
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
    const {query: {groupId, careerCenterId}, replace} = useRouter()
    const [notifications, setNotifications] = useState([]);
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const {userData, authenticatedUser} = useAuth()

    const populates = [
        {child: 'adminEmail', root: 'userData', childAlias: "admin"}, // replace owner with user object
        {child: 'subAdminEmails', root: 'userData', childAlias: 'subAdmins'} // replace owner with user object
    ]

    useFirestoreConnect(() => [{
        collection: `careerCenterData`,
        doc: groupId || careerCenterId,
        storeAs: "group",
        populates
    }], [groupId, careerCenterId])

    const group = useSelector(state => populate(state.firestore, "group", populates) || {})



    if(!isEmptyObject(group)){
        group.id = groupId || careerCenterId
    }

    useEffect(() => {
        if (unAuthorized()) {
            replace("/");
        }
    }, [group, authenticatedUser, userData]);

    const isAdmin = () => {
        return userData?.isAdmin
            || (authenticatedUser?.email === group?.adminEmail)
            || (group?.subAdminEmails?.includes(authenticatedUser?.email))
    }

    const unAuthorized = () => {
        return Boolean(
            (!isEmptyObject(group) && authenticatedUser && userData) && !isAdmin()
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
            href: `/group/${group.id}/admin/analytics`,
            icon: AnalyticsIcon,
            title: 'Analytics'
        },
        {
            href: `/group/${group.id}/admin/roles`,
            icon: RolesIcon,
            title: 'Roles'
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
                notifications={notifications}
                setNotifications={setNotifications}
                onMobileNavOpen={() => setMobileNavOpen(true)}
            />
            <NavBar
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
                        {!isEmptyObject(group) && React.cloneElement(children, {
                            notifications,
                            isAdmin: isAdmin(),
                            setNotifications,
                            group, ...props
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withFirebase(GroupDashboardLayout);
