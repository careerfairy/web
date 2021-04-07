import PropTypes from 'prop-types'
import React, {useMemo, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import NavBar from './NavBar';
import {withFirebase} from "../../context/firebase";
import {useAuth} from "../../HOCs/AuthProvider";
import styles from "../../materialUI/styles/groupDashboardStyles";
import {CircularProgress} from "@material-ui/core";
import {useRouter} from "next/router";
import * as actions from '../../store/actions'
import {useDispatch} from "react-redux";
import TopBar from "./TopBar";
import Head from "next/head";
import Footer from "../../components/views/footer/Footer";
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks";

const useStyles = makeStyles(styles);

const NextLivestreamsLayout = (props) => {
    const {children} = props
    const classes = useStyles();
    const dispatch = useDispatch()
    const [isMobileNavOpen, setMobileNavOpen] = useState(true);
    const {userData, authenticatedUser} = useAuth()
    const {replace} = useRouter()
    const enqueueSnackbar = (...args) => dispatch(actions.enqueueSnackbar(...args))


    const {mainLinks, secondaryLinks} = useGeneralLinks()

    const isAdmin = useMemo(() => userData?.isAdmin, [userData?.isAdmin])

    const handleDrawerOpen = () => setMobileNavOpen(true)
    const handleDrawerClose = () => setMobileNavOpen(false)

    return (
        <React.Fragment>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <div className={classes.root}>
                <TopBar
                    links={mainLinks}
                    onMobileNavOpen={handleDrawerOpen}
                    onMobileClose={handleDrawerClose}
                    {...props}
                />
                <NavBar
                    {...props}
                    drawerTopLinks={mainLinks}
                    drawerBottomLinks={secondaryLinks}
                    onMobileNavOpen={handleDrawerOpen}
                    onMobileClose={handleDrawerClose}
                    openMobile={isMobileNavOpen}
                />
                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {(isAdmin) ? React.Children.map(children, child => React.cloneElement(child, {
                                isAdmin,
                                ...props
                            })) : (
                                <CircularProgress style={{margin: "auto"}}/>
                            )}
                            <Footer/>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};


NextLivestreamsLayout.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.object,
}

NextLivestreamsLayout.defaultProps = {}
export default withFirebase(NextLivestreamsLayout);
