import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { withFirebase } from "../context/firebase/FirebaseServiceContext";
import Loader from "../components/views/loader/Loader";

import Head from "next/head";
import {Container, Typography} from "@mui/material"
import Groups from "../components/views/groups/Groups";
import { useAuth } from "../HOCs/AuthProvider";
import GeneralLayout from "../layouts/GeneralLayout";

const JoinGroup = (props) => {
   const router = useRouter();
   const [groups, setGroups] = useState([]);
   const { userData, authenticatedUser: user, loading } = useAuth();

   useEffect(() => {
      if (user === null) {
         router.replace("/login");
      }
   }, [user]);

   useEffect(() => {
      if (userData) {
         const unsubscribe = props.firebase.listenToGroups((querySnapshot) => {
            let careerCenters = [];
            querySnapshot.forEach((doc) => {
               let careerCenter = doc.data();
               careerCenter.id = doc.id;
               if (!userData.groupIds?.includes(careerCenter.id)) {
                  careerCenters.push(careerCenter);
               }
            });
            setGroups(careerCenters);
         });
         return () => unsubscribe();
      }
   }, [userData]);

   if (user === null || userData === null || loading === true) {
      return <Loader />;
   }

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Join Groups</title>
         </Head>
         <GeneralLayout>
            <Container
               style={{
                  marginTop: "2rem",
                  minHeight: "60vh",
               }}
            >
               <Typography align="center" variant="h3" gutterBottom>
                  Follow More Career&nbsp;Groups
               </Typography>
               <Groups userData={userData} groups={groups} />
            </Container>
         </GeneralLayout>
      </>
   );
};

export default withFirebase(JoinGroup);
