import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Head from "next/head";
import {useRouter} from "next/router";
import {withFirebase} from "../../context/firebase";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        display: 'flex',
        height: '100%',
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
        overflow: 'hidden'
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
    const {query: {groupId, careerCenterId}} = useRouter()
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);
    const [group, setGroup] = useState({});

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
                        {React.cloneElement(children, {group, ...props})}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withFirebase(GroupDashboardLayout);
