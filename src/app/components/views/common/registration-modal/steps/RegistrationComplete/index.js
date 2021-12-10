import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grow,
   Typography,
} from "@material-ui/core";
import { RegistrationContext } from "../../../../../../context/registration/RegistrationContext";
import SuccessCheckmark from "./SuccessCheckmark";
import Link from "materialUI/NextNavLink";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   root: {},
   title: {
      color: theme.palette.primary.main,
      fontWeight: 600,
   },
   linkBtn: {
      textDecoration: "none !important",
   },
   actions: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
   },
   content: {
      background: theme.palette.primary.main,
   },
   titleWrapper: {
      paddingTop: theme.spacing(2),
   },
}));

const RegistrationComplete = () => {
   const {
      group,
      livestream,
      promptOtherEventsOnFinal,
      handleClose,
   } = useContext(RegistrationContext);
   const {
      query: { groupId, referrerId },
   } = useRouter();

   // const getRefererUrl = () => {
   //     let url = `/next-livestreams?livestreamId=${livestream.id}`;
   //     if (userData?.authId) {
   //         url = `/next-livestreams?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
   //         if (groupId) {
   //             url = `/next-livestreams/${groupId}?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
   //         } else if (careerCenters?.[0]?.id) {
   //             // If there's only one group, please send me to that groups page
   //             url = `/next-livestreams/${careerCenters[0].id}?livestreamId=${livestream.id}&referrerId=${userData.authId}`;
   //         }
   //     }
   //     return `${getBaseUrl()}${url}`;
   // };

   function handleUrl() {
      return {
         pathname: groupId
            ? `/next-livestreams/${groupId}`
            : group?.id
            ? `/next-livestreams/${group.id}`
            : "/next-livestreams",
         query: {
            ...(referrerId && { referrerId }),
            ...(livestream?.id && {
               livestreamId: livestream.id,
            }),
         },
      };
   }

   const classes = useStyles();
   return (
      <>
         <DialogContent className={classes.content}>
            <SuccessCheckmark />
         </DialogContent>
         <Grow timeout={1000} in>
            <div className={classes.titleWrapper}>
               <Typography
                  variant="h5"
                  align="center"
                  className={classes.title}
               >
                  Thank you!
               </Typography>
            </div>
         </Grow>
         <DialogActions>
            <Box p={2} className={classes.actions}>
               {promptOtherEventsOnFinal ? (
                  <Button
                     className={classes.linkBtn}
                     color="primary"
                     component={Link}
                     href={handleUrl()}
                     variant="contained"
                     size="large"
                  >
                     See all our events
                  </Button>
               ) : (
                  <Button
                     variant="contained"
                     size="large"
                     onClick={handleClose}
                     color="primary"
                     autoFocus
                  >
                     Finish
                  </Button>
               )}
            </Box>
         </DialogActions>
      </>
   );
};

export default RegistrationComplete;
