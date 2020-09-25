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
    const [loading, setLoading] = useState(false)
    const {authenticatedUser, userData} = useContext(UserContext)


    useEffect(() => {
        if (!authenticatedUser) {
            router.push('/login');
        }
    }, [authenticatedUser]);

    return (
        <div className={classes.root}>
            <Head>
                <title key="title">CareerFairy | My Profile</title>
            </Head>
            <Header classElement='relative white-background'/>
            <ProfileNav user={authenticatedUser} userData={userData}/>
            <Footer/>
        </div>
    );
}

export default withFirebase(UserProfile)
