import {makeStyles} from '@material-ui/core/styles';
import {withFirebase} from 'context/firebase';
import Header from '../components/views/header/Header';
import Head from 'next/head';
import Footer from "../components/views/footer/Footer";
import ProfileNav from "../components/views/profile/ProfileNav";
import {useAuth} from "../HOCs/AuthProvider";


const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
    },
    content: {
        minHeight: "20vh",
        flexGrow: 1
    }
}));

const UserProfile = () => {
    const classes = useStyles();
    const {userData, authenticatedUser: user} = useAuth();

    return (
        <div className={classes.root}>
            <Head>
                <title key="title">CareerFairy | My Profile</title>
            </Head>
            <Header classElement='relative white-background'/>
            {userData ? <ProfileNav user={user} userData={userData}/> : <div className={classes.content}/>}
            <Footer/>
        </div>
    );
}

export default withFirebase(UserProfile)
