import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useFirebase } from "context/firebase";
import FeaturedCompanyCard from "./FeaturedCompanyCard";
import { Box, Grid } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {},
}));
const FeaturedCompanies = () => {
   const classes = useStyles();
   const { getFeaturedCompanies } = useFirebase();

   const [featuredCompanies, setFeaturedCompanies] = useState([]);

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
            {featuredCompanies.map((company) => (
               <Grid key={company.id} item xs={12} sm={4} md={3}>
                  <FeaturedCompanyCard key={company.id} company={company} />
               </Grid>
            ))}
         </Grid>
      </Box>
   );
};

export default FeaturedCompanies;
