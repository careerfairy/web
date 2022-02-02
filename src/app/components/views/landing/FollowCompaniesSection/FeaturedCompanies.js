import React, { useEffect, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { useFirebaseService } from "context/firebase/FirebaseServiceContext";
import FeaturedCompanyCard from "./FeaturedCompanyCard";
import { Box, Grid } from "@mui/material";
import GroupsUtil from "../../../../data/util/GroupsUtil";
import { useAuth } from "../../../../HOCs/AuthProvider";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const FeaturedCompanies = ({ handleOpenJoinModal }) => {
   const classes = useStyles();
   const { getFeaturedCompanies } = useFirebaseService();

   const [featuredCompanies, setFeaturedCompanies] = useState([]);
   const { userData, authenticatedUser } = useAuth();

   useEffect(() => {
      (async function () {
         const snaps = await getFeaturedCompanies();
         const newFeaturedCompanies = snaps.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }));
         setFeaturedCompanies(newFeaturedCompanies);
      })();
   }, []);

   return (
      <Box p={2}>
         <Grid
            container
            justifyContent="center"
            spacing={2}
            className={classes.root}
         >
            {featuredCompanies.map((company) => {
               const following = GroupsUtil.checkIfUserFollows(
                  { authenticatedUser, userData },
                  company
               );
               return (
                  <Grid key={company.id} item xs={12} sm={4} md={3}>
                     <FeaturedCompanyCard
                        handleFollow={
                           following ? null : () => handleOpenJoinModal(company)
                        }
                        key={company.id}
                        company={company}
                     />
                  </Grid>
               );
            })}
         </Grid>
      </Box>
   );
};

export default FeaturedCompanies;
