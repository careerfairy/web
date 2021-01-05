import {useContext, useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {withFirebase} from 'context/firebase';
import Header from '../components/views/header/Header';
import Head from 'next/head';
import {useRouter} from "next/router";
import Loader from "../components/views/loader/Loader";
import Footer from "../components/views/footer/Footer";
import ProfileNav from "../components/views/profile/ProfileNav";
import UserContext from "../context/user/UserContext";
import {useAuth} from "../HOCs/AuthProvider";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "rgb(250,250,250)",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
    },
}));

const UserProfile = ({firebase}) => {
    const classes = useStyles();
    const router = useRouter();
    const {userData, authenticatedUser: user, loading} = useAuth();

    // useEffect(() => {
    //     if (user === null) {
    //         router.replace("/login");
    //     }
    // }, [user]);
    //
    // if (user === null || userData === null || loading === true) {
    //     return <Loader/>;
    // }

    return (
        <div className={classes.root}>
            <Head>
                <title key="title">CareerFairy | My Profile</title>
            </Head>
            <Header classElement='relative white-background'/>
            <ProfileNav user={user} userData={userData}/>
            <Footer/>
        </div>
    );
}

export default withFirebase(UserProfile)
