import PropTypes from 'prop-types'
import React, {useMemo, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import {isEmpty, isLoaded} from "react-redux-firebase";
import {useSelector} from "react-redux";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/groupDashboardStyles";
import useDashboardRedirect from "../../components/custom-hook/useDashboardRedirect";
import useAdminGroup from "../../components/custom-hook/useAdminGroup";
import useDashboardLinks from "../../components/custom-hook/useDashboardLinks";

const useStyles = makeStyles(styles);

const GroupDashboardLayout = (props) => {
    const {children, firebase, isCompany} = props
    const classes = useStyles();
    const {query: {groupId, companyId}} = useRouter()
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const {userData, authenticatedUser} = useAuth()
    const notifications = useSelector(({firestore}) => firestore.ordered.notifications || [])

    const group = useAdminGroup(isCompany ? companyId : groupId, isCompany)

    useDashboardRedirect(group, firebase, isCompany)

    const {headerLinks, drawerTopLinks, drawerBottomLinks} = useDashboardLinks(group, isCompany)

    const isAdmin = useMemo(() => userData?.isAdmin || (group?.adminEmails?.includes(authenticatedUser?.email)), [userData?.isAdmin, group?.adminEmails, authenticatedUser?.email])

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
                            isAdmin,
                            group,
                            isCompany,
                            ...props
                        }))}
                    </div>
                </div>
            </div>
        </div>
    );
};


GroupDashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.object,
}

GroupDashboardLayout.defaultProps = {
}
export default withFirebase(GroupDashboardLayout);
