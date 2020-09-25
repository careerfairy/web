import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import {useContext} from "react";
import Feed from "../components/views/feed/Feed";
import UserContext from "../context/user/UserContext";


const feed = () => {

    const {userData, authenticatedUser} = useContext(UserContext)


    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Feed</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Feed user={authenticatedUser} userData={userData}/>
            <Footer/>
        </GreyBackground>
    );
};

export default feed;
