import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import { withFirebase } from "context/firebase";
import Head from "next/head";
import ProfileNav from "../components/views/profile/ProfileNav";
import { useAuth } from "../HOCs/AuthProvider";
import GeneralLayout from "../layouts/GeneralLayout";

const useStyles = makeStyles((theme) => ({
   content: {
      minHeight: "60vh",
   },
}));

const UserProfile = () => {
   const classes = useStyles();
   const { userData, authenticatedUser: user } = useAuth();

   return (
      <React.Fragment>
         <Head>
            <title key="title">CareerFairy | My Profile</title>
         </Head>
         <GeneralLayout>
            {userData ? (
               <ProfileNav user={user} userData={userData} />
            ) : (
               <div className={classes.content} />
            )}
         </GeneralLayout>
      </React.Fragment>
   );
};

export default withFirebase(UserProfile);
