import {GlobalBackground, GreyBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import NewLivestreamForm from "../components/views/newLivestreamForm/NewLivestreamForm";
import React from "react";


const newLivestreams = () => {

    return (
        <GreyBackground>
            <Head>
                <title key="title">CareerFairy | Create Live Streams</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <NewLivestreamForm/>
            <Footer/>
        </GreyBackground>
    );
};

export default newLivestreams;