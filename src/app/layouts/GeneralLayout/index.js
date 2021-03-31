import PropTypes from 'prop-types'
import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {withFirebase} from "../../context/firebase";
import {useSelector} from "react-redux";
import styles from "../../materialUI/styles/groupDashboardStyles";
import useGeneralLinks from "../../components/custom-hook/useGeneralLinks";
import TopBar from "../../components/views/header/TopBar";
import SideBar from "../../components/views/header/SideBar";
import Footer from "../../components/views/footer/Footer";

const useStyles = makeStyles(styles);
const useWrapperStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flex: '1 1 auto',
        overflow: 'hidden',
        paddingTop: 64,
        [theme.breakpoints.down('xs')]: {
            paddingTop: 56
        },
    },
}))

const GeneralLayout = (props) => {
    const {children} = props
    const classes = useStyles();
    const wrapperClasses = useWrapperStyles();
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const notifications = useSelector(({firestore}) => firestore.ordered.notifications || [])
    const {mainLinks, secondaryLinks} = useGeneralLinks()


    return (
        <div className={classes.root}>
            <TopBar
                links={mainLinks}
                notifications={notifications}
                onMobileNavOpen={() => setMobileNavOpen(true)}
            />
            <SideBar
                drawerTopLinks={mainLinks}
                drawerBottomLinks={secondaryLinks}
                headerLinks={mainLinks}
                onMobileClose={() => setMobileNavOpen(false)}
                openMobile={isMobileNavOpen}
            />
            <div className={wrapperClasses.root}>
                <div className={classes.contentContainer}>
                    <div className={classes.content}>
                        {React.Children.map(children, child => React.cloneElement(child, {
                            notifications,
                            ...props
                        }))}
                        <Footer/>
                    </div>
                </div>
            </div>
        </div>
    );
};


GeneralLayout.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.object,
}

GeneralLayout.defaultProps = {}
export default withFirebase(GeneralLayout);
