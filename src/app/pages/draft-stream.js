import {
    TealBackground
} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import React, {useContext, useEffect, useState} from "react";
import {Typography} from "@material-ui/core";
import {useRouter} from "next/router";
import UserContext from "../context/user/UserContext";
import Loader from "../components/views/loader/Loader";
import DraftStreamForm from "../components/views/DraftStreamForm/DraftStreamForm";


const draftStream = () => {

    const {replace, asPath: absolutePath} = useRouter();
    const {userData, authenticatedUser: user, hideLoader} = useContext(UserContext);
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        if (user === null) {
            replace({
                pathname: `/login`,
                query: {absolutePath},
            });
        }
    }, [user, userData]);


    return hideLoader && userData && userData.isAdmin ? (
        <TealBackground style={{paddingBottom: 0}}>
            <Head>
                <title key="title">CareerFairy | Create Live Streams</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Typography variant="h3" align="center" style={{marginTop: submitted? "15vh" :"1.5rem", color: "white"}} gutterBottom>
                {submitted ? "Success!" : "Draft a Livestream"}
            </Typography>
            <DraftStreamForm submitted={submitted} setSubmitted={setSubmitted}/>
            <Footer/>
        </TealBackground>
    ) : <Loader/>;
};

export default draftStream;