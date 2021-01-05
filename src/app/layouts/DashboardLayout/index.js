import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core';
import NavBar from './NavBar';
import TopBar from './TopBar';
import Head from "next/head";

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

const DashboardLayout = ({children, title, group}) => {
    const classes = useStyles();
    const [isMobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <>
            <Head>
                <title key="title">{title}</title>
            </Head>
            <div className={classes.root}>
                <TopBar  onMobileNavOpen={() => setMobileNavOpen(true)}/>
                <NavBar
                    group={group}
                    onMobileClose={() => setMobileNavOpen(false)}
                    openMobile={isMobileNavOpen}
                />
                <div className={classes.wrapper}>
                    <div className={classes.contentContainer}>
                        <div className={classes.content}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;
