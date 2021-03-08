import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import {isEmpty, isLoaded} from "react-redux-firebase";
import {useSelector} from "react-redux";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/groupDashboardStyles";
import useDashboardInvite from "../../components/custom-hook/useDashboardInvite";
import useAdminGroup from "../../components/custom-hook/useAdminGroup";
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks";

const useStyles = makeStyles(styles);

const GroupDashboardLayout = (props) => {
    const {children, firebase} = props
    const classes = useStyles();
    const {query: {groupId}} = useRouter()
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const {userData, authenticatedUser} = useAuth()
    const notifications = useSelector(({firestore}) => firestore.ordered.notifications || [])

    const group = useAdminGroup(groupId)

    const isAdmin = () => {
        return userData?.isAdmin
            || (group?.adminEmails?.includes(authenticatedUser?.email))
    }

    useDashboardInvite(group, firebase)
    console.log("-> GroupDashboardLayout");
    const {headerLinks, drawerTopLinks, drawerBottomLinks} = useDashboardLinks(group)


    return (
        <div className={classes.root}>
            <TopBar
                links={headerLinks}
                notifications={notifications}
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
                        {(isLoaded(group) && !isEmpty(group)) && React.Children.map(children, child => React.cloneElement(child, {
                            notifications,
                            isAdmin: isAdmin(),
                            group, ...props
                        }))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withFirebase(GroupDashboardLayout);
