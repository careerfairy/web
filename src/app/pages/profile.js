import {useEffect, useState} from 'react';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import {withFirebase} from '../data/firebase';
import Header from '../components/views/header/Header';
import Head from 'next/head';
import {useRouter} from "next/router";
import Loader from "../components/views/loader/Loader";
import Footer from "../components/views/footer/Footer";
import ProfileNav from "../components/views/profile/ProfileNav";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "rgb(250,250,250)",
        height: "100%",
        minHeight: "100vh",
    },
}));

const UserProfile = ({firebase}) => {
    const classes = useStyles();
    const router = useRouter();

    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);

    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                router.replace('/login');
            }
        })
    }, []);

    useEffect(() => {
        setLoading(true);
        if (user) {
            firebase.listenToUserData(user.email, querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                user.id = querySnapshot.id;
                if (user) {
                    setUserData(user);
                }
            })
        }
    }, [user]);

    if (user === null || userData == null || loading === true) {
        return <Loader/>;
    }

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
