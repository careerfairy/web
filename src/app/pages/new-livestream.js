import {
    DarkBackground,
    GlobalBackground,
    GreyBackground,
    TealBackground
} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import NewLivestreamForm from "../components/views/newLivestreamForm/NewLivestreamForm";
import React, {useContext, useEffect, useState} from "react";
import {Typography} from "@material-ui/core";
import {useRouter} from "next/router";
import UserContext from "../context/user/UserContext";
import Loader from "../components/views/loader/Loader";


const newLivestream = () => {

    const {replace, asPath: absolutePath, back} = useRouter();
    const {userData, authenticatedUser: user, hideLoader} = useContext(UserContext);

    useEffect(() => {
        if (user === null) {
            replace({
                pathname: `/login`,
                query: {absolutePath},
            });
        }

        if (userData && !userData.isAdmin) {
            replace(`/`);
        }
    }, [user, userData]);


    return hideLoader && userData && userData.isAdmin ? (
        <TealBackground style={{paddingBottom: 0}}>
            <Head>
                <title key="title">CareerFairy | Create Livestreams</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Typography variant="h3" align="center" style={{marginTop: "1.5rem", color: "white"}}>
                Create a Livestream
            </Typography>
            <NewLivestreamForm/>
            <Footer/>
        </TealBackground>
    ) : <Loader/>;
};

export default newLivestream;