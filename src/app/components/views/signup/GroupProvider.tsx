import React, { useEffect, useState, Fragment } from "react";
import Groups from "../groups/Groups";
import { withFirebase } from "../../../context/firebase/FirebaseServiceContext";
import {Box, Typography} from "@mui/material";
import { useAuth } from "../../../HOCs/AuthProvider";
import {useRouter} from "next/router"

const GroupProvider = ({ firebase }) => {
   const {query: {absolutePath}} = useRouter();
   const { userData } = useAuth();
   const [groups, setGroups] = useState([]);

   useEffect(() => {
      if (userData) {
         const unsubscribe = firebase.listenToGroups((querySnapshot) => {
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

   return userData ? (
      <Fragment>
         <Typography variant='h6' align='center'>Follow Career Groups</Typography>
         <Typography variant="body2" component="p" align='center'>
            Try companies you like or your university
         </Typography>
         <Box style={{height: '450px', overflow: 'auto'}} mt={1} px={1}>
            <Groups
              absolutePath={absolutePath}
              makeSix={6}
              userData={userData}
              groups={groups}
              hideNextLiveStreamsButton={true}
            />
         </Box>
      </Fragment>
   ) : null;
};

export default withFirebase(GroupProvider);
