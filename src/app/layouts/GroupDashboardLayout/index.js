import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Head from "next/head";
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";
import {isEmptyObject} from "../../components/helperFunctions/HelperFunctions";
import {useAuth} from "../../HOCs/AuthProvider";

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
    console.log("-> pathname", pathname);
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

    return (
        <div className={classes.root}>
            <TopBar onMobileNavOpen={() => setMobileNavOpen(true)}/>
            <NavBar
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
