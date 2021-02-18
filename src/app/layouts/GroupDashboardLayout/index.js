import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import TopBar from './TopBar';
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
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
import {isEmpty, isLoaded, populate, useFirestoreConnect} from "react-redux-firebase";
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

    const populates = [
        {child: 'adminEmails', root: 'userData', childAlias: 'admins'} // replace owner with user object
    ]

    const getQueries = () => {
        let queriesArray = []
        const targetId = groupId || careerCenterId
        if (targetId) {
            queriesArray.push(...[{
                collection: `careerCenterData`,
                doc: targetId,
                storeAs: "group",
                populates
            },
                {
                    collection: `careerCenterData`,
                    doc: targetId,
                    subcollections: [{
                        collection: "admins",
                    }],
                    storeAs: "adminRoles",
                }
            ])
            if (authenticatedUser) {
                queriesArray.push({
                    collection: `careerCenterData`,
                    doc: targetId,
                    subcollections: [{
                        collection: "admins",
                        doc: authenticatedUser.email
                    }],
                    storeAs: "userRole",
                })
            }
        }

        return queriesArray
    }

    useFirestoreConnect(getQueries(), [groupId, careerCenterId, authenticatedUser])

    const userRole = useSelector(({firestore}) => firestore.data.userRole || {})
    const group = useSelector(state => populate(state.firestore, "group", populates))

    if (isLoaded(group) && !isEmpty(group)) {
        group.id = groupId || careerCenterId
    }

    useEffect(() => {
        (async function () {
            if (joiningGroup) return
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
                console.log("-> was in the handle join");
                // If you're logged in and are on the base admin page
                await handleJoinDashboard()
                return
            }
            if (unAuthorized()) {
                replace("/");
                return
            }
            if (pathname === "/group/[groupId]/admin" && isLoaded(group) && !isEmpty(group) && isAdmin()) {
                await replace(`/group/${group.id}/admin/analytics`)
            }
        })()
    }, [group, authenticatedUser, userData, pathname]);

    const isAdmin = () => {
        return userData?.isAdmin
            || (group?.adminEmails?.includes(authenticatedUser?.email))
    }

    const unAuthorized = () => {
        return Boolean(
            ((isLoaded(group) && !isEmpty(group) && authenticatedUser.isLoaded && userData) && !isAdmin())
        )
    }

    const isLoggedIn = () => authenticatedUser.isLoaded && !authenticatedUser.isEmpty

    const handleJoinDashboard = async () => {
        try {
            const isValidInvite = await firebase.validateDashboardInvite(dashboardInviteId, group.id)
            if (!isValidInvite) {
                await replace("/")
                enqueueSnackbar("This invite link provided is no longer valid", {
                    variant: "error",
                    preventDuplicate: true,
                })
            } else {
                setJoiningGroup(true)
                await firebase.joinGroupDashboard(group.id, userData.userEmail, dashboardInviteId)
                await replace(`/group/${group.id}/admin/analytics`)
                enqueueSnackbar(`Congrats, you are now an admin of ${group.universityName}`, {
                    variant: "success",
                    preventDuplicate: true,
                })
                setJoiningGroup(false)
            }
        } catch (error) {
            console.error("-> error", error);
            enqueueSnackbar(GENERAL_ERROR, {
                preventDuplicate: true,
                variant: "error",
            })
            setJoiningGroup(false)
        }
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

    ] : [];

    if (userRole.role === "mainAdmin" && (isLoaded(group) && !isEmpty(group))) {
        //Only mainAdmin has access to this button in their nav
        drawerTopLinks.push({
            href: `/group/${group.id}/admin/roles`,
            icon: RolesIcon,
            title: 'Roles'
        })
    }

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
