import {
    TealBackground
} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import React, {useState} from "react";
import {Typography} from "@material-ui/core";
import DraftStreamForm from "../components/views/draftStreamForm/DraftStreamForm";
import {useAuth} from "../HOCs/AuthProvider";


const draftStream = () => {

    const [submitted, setSubmitted] = useState(false)

    return (
        <TealBackground style={{paddingBottom: 0}}>
            <Head>
                <title key="title">CareerFairy | Draft a Livestream</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Typography variant="h3" align="center" style={{marginTop: submitted ? "15vh" : "1.5rem", color: "white"}}
                        gutterBottom>
                {submitted ? "Success!" : "Draft a Livestream"}
            </Typography>
            <DraftStreamForm submitted={submitted} setSubmitted={setSubmitted}/>
            <Footer/>
        </TealBackground>
    )
};

export default draftStream;