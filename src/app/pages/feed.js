import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import {useEffect, useState} from "react";
import Loader from "../components/views/loader/Loader";
import {withFirebase} from "../data/firebase";
import {useRouter} from "next/router";
import Feed from "../components/views/feed/Feed";


const feed = ({firebase}) => {
    const router = useRouter();
    const {query: {livestreamId}} = router
    const {query: {careerCenterId}} = router

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
            const unsubscribe = firebase.listenToUserData(user.email, querySnapshot => {
                setLoading(false);
                let user = querySnapshot.data();
                user.id = querySnapshot.id;
                if (user) {
                    setUserData(user);
                }
            })
            return () => unsubscribe
        }
    }, [user]);


    if (user === null || userData == null || loading === true) {
        return <Loader/>;
    }


    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Feed careerCenterId={careerCenterId} livestreamId={livestreamId} user={user} userData={userData}/>
            <Footer/>
        </GreyBackground>
    );
};

export default withFirebase(feed);
