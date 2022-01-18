import { TealBackground } from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import NewLivestreamForm from "../components/views/newLivestreamForm/NewLivestreamForm";
import React from "react";
import { Typography } from "@mui/material";
import { useAuth } from "../HOCs/AuthProvider";

const newLivestream = () => {
   const { authenticatedUser: user } = useAuth();

   return (
      <TealBackground style={{ paddingBottom: 0 }}>
         <Head>
            <title key="title">CareerFairy | Create Live Streams</title>
         </Head>
         <div style={{ background: "rgb(44, 66, 81)" }}>
            <Header color="white" />
         </div>
         <Typography
            variant="h3"
            align="center"
            style={{ marginTop: "1.5rem", color: "white" }}
         >
            Create a Live Stream
         </Typography>
         <NewLivestreamForm user={user} />
         <Footer />
      </TealBackground>
   );
};

export default newLivestream;
