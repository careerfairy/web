import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import {useEffect, useState} from "react";
import {withFirebase} from "context/firebase";
import Feed from "../components/views/feed/Feed";


const feed = ({firebase}) => {


    const [userData, setUserData] = useState(null)
    const [user, setUser] = useState(null);


    useEffect(() => {
        firebase.auth.onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            }
        })
    }, []);

    useEffect(() => {
        if (user) {
            const unsubscribe = firebase.listenToUserData(user.email, querySnapshot => {
                let user = querySnapshot.data();
                user.id = querySnapshot.id;
                if (user) {
                    setUserData(user);
                }
            })
            return () => unsubscribe
        }
    }, [user]);


    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Feed user={user} userData={userData}/>
            <Footer/>
        </GreyBackground>
    );
};

export default withFirebase(feed);
