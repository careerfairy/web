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
import {useFirestoreConnect, populate, isLoaded, isEmpty} from "react-redux-firebase";
import {useSelector} from "react-redux";
import {useSnackbar} from "notistack";
import {GENERAL_ERROR} from "../../components/util/constants";


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
    const {query: {groupId, careerCenterId, dashboardInviteId}, pathname, replace, push} = useRouter()
    const {enqueueSnackbar} = useSnackbar()
    const [notifications, setNotifications] = useState([]);
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const [joiningGroup, setJoiningGroup] = useState(false);
    const {userData, authenticatedUser} = useAuth()
    console.log("-> userData", userData);

    const populates = [
        {child: 'adminEmails', root: 'userData', childAlias: 'admins'} // replace owner with user object
    ]
    useFirestoreConnect(() => (groupId || careerCenterId) && [
        {
            collection: `careerCenterData`,
            doc: groupId || careerCenterId,
            storeAs: "group",
            populates
        },
        {
            collection: `careerCenterData`,
            doc: groupId || careerCenterId,
            subcollections: [{
                collection: "admins",
            }],
            storeAs: "admins",
        }
    ], [groupId, careerCenterId])
    const group = useSelector(state => populate(state.firestore, "group", populates))
    console.log("-> isLoaded(group)", isLoaded(group));
    console.log("-> isEmpty(group)", isEmpty(group));

    if (isLoaded(group) && !isEmpty(group)) {
        group.id = groupId || careerCenterId
    }

    useEffect(() => {
        (async function () {
            if (isEmpty(group) && isLoaded(group)) {
                await replace("/");
                enqueueSnackbar("The page you tried to visit is invalid", {
                    variant: "error",
                    preventDuplicate: true,
                })
                return
            }
            if (
                pathname === "/group/[groupId]/admin"
                && dashboardInviteId
                && isLoggedIn()
                && unAuthorized()
            ) {
                // If you're logged in and are on the base admin page
                await handleJoinDashboard()
                return
            }
            if (unAuthorized()) {
                console.log("-> dashboardInviteId in unauthorized", dashboardInviteId);
                replace("/");
            }
        })()
    }, [group, authenticatedUser, userData, pathname]);

    const isAdmin = () => {
        return userData?.isAdmin
            || (authenticatedUser?.email === group?.adminEmail)
            || (group?.adminEmails?.includes(authenticatedUser?.email))
    }

    const unAuthorized = () => {
        return Boolean(
            ((isLoaded(group) && authenticatedUser.isLoaded && userData) && !isAdmin())
            || (isLoaded(group) && isEmpty(group))
        )
    }

    const isLoggedIn = () => authenticatedUser.isLoaded && !authenticatedUser.isEmpty

    const handleJoinDashboard = async () => {
        try {
            if (joiningGroup) return
            const isValidInvite = await firebase.validateDashboardInvite(dashboardInviteId, group.id)
            console.log("-> isValidInvite", isValidInvite);
            if (!isValidInvite) {
                await replace("/")
                enqueueSnackbar("This invite link provided is no longer valid", {
                    variant: "error",
                    preventDuplicate: true,
                })
            } else {
                setJoiningGroup(true)
                console.log("-> in success");
                // console.log("-> group.id", group.id);
                // console.log("-> userData.userEmail", userData.userEmail);
                // console.log("-> dashboardInviteId", dashboardInviteId);
                await firebase.joinGroupDashboard(group.id, userData.userEmail, dashboardInviteId)
                await push(`/group/${group.id}/admin/analytics`)
                enqueueSnackbar(`Congrats, you are now an admin of ${group.universityName}`, {
                    variant: "success",
                    preventDuplicate: true,
                })

            }

        } catch (error) {
            console.error("-> error", error);
            enqueueSnackbar(GENERAL_ERROR, {
                preventDuplicate: true,
                variant: "error",
            })
        }
        setJoiningGroup(false)
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

    const drawerTopLinks = (isLoaded(group) && !isEmpty(group)) ? [
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
    ] : [];

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
            {(isLoaded(group) && !isEmpty(group)) && <NavBar
                drawerTopLinks={drawerTopLinks}
                drawerBottomLinks={drawerBottomLinks}
                headerLinks={headerLinks}
                group={group}
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
            />}
            <div className={classes.wrapper}>
                <div className={classes.contentContainer}>
                    <div className={classes.content}>
                        {(isLoaded(group) && !isEmpty(group)) && React.cloneElement(children, {
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
