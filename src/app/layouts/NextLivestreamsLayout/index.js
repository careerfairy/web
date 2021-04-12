import PropTypes from 'prop-types'
import React, {useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import NavBar from './NavBar';
import {withFirebase} from "../../context/firebase";
import styles from "../../materialUI/styles/layoutStyles/nextLivestreamsLayoutStyles";
import TopBar from "./TopBar";
import Head from "next/head";
import Footer from "../../components/views/footer/Footer";
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks";

const useStyles = makeStyles(styles);

const NextLivestreamsLayout = (props) => {
    const {children, currentGroup} = props
    const drawerWidth = 300
    const classes = useStyles({drawerWidth});
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    const {mainLinks, secondaryLinks} = useGeneralLinks()

    const handleDrawerOpen = () => setMobileNavOpen(true)
    const handleDrawerClose = () => setMobileNavOpen(false)
    const handleDrawerToggle = () => setMobileNavOpen(!isMobileNavOpen)

    return (
        <React.Fragment>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <div className={classes.root}>
                <TopBar
                    links={mainLinks}
                    currentGroup={currentGroup}
                    onMobileNavOpen={handleDrawerOpen}
                />
                <NavBar
                    drawerTopLinks={mainLinks}
                    handleDrawerToggle={handleDrawerToggle}
                    drawerWidth={drawerWidth}
                    drawerBottomLinks={secondaryLinks}
                    onMobileNavOpen={handleDrawerOpen}
                    onMobileClose={handleDrawerClose}
                    openMobile={isMobileNavOpen}
                />
                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {/*{React.Children.map(children, child => React.cloneElement(child, {*/}
                            {/*    ...props*/}
                            {/*}))}*/}
                            {children}
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
