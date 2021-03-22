import PropTypes from 'prop-types'
import React, {useMemo, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import {withFirebase} from "../../context/firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import TopBar from "./TopBar";
import styles from "../../materialUI/styles/groupDashboardStyles";
import {CircularProgress} from "@material-ui/core";
import useAdminLinks from "../../components/custom-hook/useAdminLinks";

const useStyles = makeStyles(styles);

const AdminDashboardLayout = (props) => {
    const {children, firebase} = props
    const classes = useStyles();
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const {userData} = useAuth()


    const {headerLinks, drawerTopLinks, drawerBottomLinks} = useAdminLinks()

    const isAdmin = useMemo(() => userData?.isAdmin, [userData?.isAdmin])

    return (
        <div className={classes.root}>
            <TopBar
                links={headerLinks}
                onMobileNavOpen={() => setMobileNavOpen(true)}
            />
            {isAdmin && <NavBar
                drawerTopLinks={drawerTopLinks}
                drawerBottomLinks={drawerBottomLinks}
                headerLinks={headerLinks}
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
            />}
            <div className={classes.wrapper}>
                <div className={classes.contentContainer}>
                    <div className={classes.content}>
                        {(isAdmin) ? React.Children.map(children, child => React.cloneElement(child, {
                            isAdmin,
                            ...props
                        })):(
                            <CircularProgress style={{margin: "auto"}}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


AdminDashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.object,
}

AdminDashboardLayout.defaultProps = {
}
export default withFirebase(AdminDashboardLayout);
