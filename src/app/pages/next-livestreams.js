import {GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";

import NextLivestreams from "../components/views/NextLivestreams/NextLivestreams";


const nextLivestreams = () => {

    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <NextLivestreams/>
            <Footer/>
        </GreyBackground>
    );
};

export default nextLivestreams;
