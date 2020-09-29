import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import {useContext} from "react";
import UserContext from "../context/user/UserContext";
import NextLivestreams from "../components/views/NextLivestreams/NextLivestreams";


const nextLivestreams = () => {

    const {userData, authenticatedUser} = useContext(UserContext)


    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <NextLivestreams user={authenticatedUser} userData={userData}/>
            <Footer/>
        </GreyBackground>
    );
};

export default nextLivestreams;
