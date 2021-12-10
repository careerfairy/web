import React, { useContext, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import GroupLogo from "../common/GroupLogo";
import {
   Box,
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Grid,
   Hidden,
} from "@material-ui/core";
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext";
import { useFirebase } from "../../../../../context/firebase";
import { useAuth } from "../../../../../HOCs/AuthProvider";
import { connectedIcon } from "../../../../../constants/svgs";
import CardMedia from "@material-ui/core/CardMedia";

const useStyles = makeStyles((theme) => ({
   root: {},
   cover: {
      objectFit: "contain",
      width: "100%",
      height: "100%",
   },
}));
const TalentPoolJoin = () => {
   const { handleNext, group, livestream } = useContext(RegistrationContext);
   const [joiningTalentPool, setJoiningTalentPool] = useState(false);
   const { joinCompanyTalentPool } = useFirebase();
   const classes = useStyles();
   const { userData } = useAuth();
   const joinTalentPool = async () => {
      try {
         setJoiningTalentPool(true);
         await joinCompanyTalentPool(
            livestream.companyId,
            userData,
            livestream.id
         );
         handleNext();
      } catch (e) {}
      setJoiningTalentPool(false);
   };
   if (!livestream) return null;

   return (
      <>
         <Box>
            <Grid container>
               <Hidden xsDown>
                  <Grid item sm={4}>
                     <CardMedia
                        className={classes.cover}
                        image={connectedIcon}
                        title="talent pool illustration"
                     />
                  </Grid>
               </Hidden>
               <Grid item xs={12} sm={8}>
                  <GroupLogo logoUrl={group.logoUrl} />
                  <DialogTitle align="center">
                     Join the {livestream.company} Talent Pool
                  </DialogTitle>
                  <DialogContent className={classes.content}>
                     <DialogContentText align="center">
                        Join {livestream.company}'s Talent Pool and be contacted
                        directly in case any relevant opportunity arises for you
                        at {livestream.company} in the future. By joining the
                        Talent Pool, you agree that your profile data will be
                        shared with {livestream.company}. Don't worry, you can
                        leave a Talent Pool at any time.
                     </DialogContentText>
                  </DialogContent>
               </Grid>
            </Grid>
         </Box>
         <DialogActions>
            <Button
               variant="text"
               disabled={joiningTalentPool}
               size="large"
               onClick={handleNext}
               color="primary"
               autoFocus
            >
               Skip
            </Button>
            <Button
               variant="contained"
               size="large"
               onClick={joinTalentPool}
               color="primary"
               autoFocus
               startIcon={
                  joiningTalentPool && (
                     <CircularProgress size={10} color="inherit" />
                  )
               }
               disabled={joiningTalentPool}
            >
               Join Talent Pool
            </Button>
         </DialogActions>
      </>
   );
};

export default TalentPoolJoin;
