import {
   Button,
   CircularProgress,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Grid,
   Grow,
} from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { useContext, useState } from "react"
import { AnalyticsEvents } from "util/analyticsConstants"
import { errorLogAndNotify } from "util/CommonUtil"
import { connectedIcon } from "../../../../../constants/svgs"
import { useFirebaseService } from "../../../../../context/firebase/FirebaseServiceContext"
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { dataLayerLivestreamEvent } from "../../../../../util/analyticsUtils"
import GroupLogo from "../common/GroupLogo"

const useStyles = makeStyles((theme) => ({
   root: {
      width: "100%",
      display: "flex",
   },
   gridContainer: {
      width: "100%",
   },
   actions: {
      alignSelf: "flex-end",
   },
   imgGrid: {
      background: theme.palette.primary.main,
   },
   imgWrapper: {
      width: "100%",
      height: "100%",
      position: "relative",
      "& img": {
         position: "absolute",
         objectFit: "contain",
         maxWidth: "100%",
         maxHeight: "100%",
         transform: "translate(-50%, -50%)",
         top: "50%",
         left: "50%",
         padding: theme.spacing(2),
      },
   },
   details: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
}))
const TalentPoolJoin = () => {
   const { handleNext, livestream } = useContext(RegistrationContext)
   const [joiningTalentPool, setJoiningTalentPool] = useState(false)
   const { joinCompanyTalentPool } = useFirebaseService()
   const classes = useStyles()
   const { userData } = useAuth()
   const joinTalentPool = async () => {
      try {
         setJoiningTalentPool(true)
         await joinCompanyTalentPool(livestream.companyId, userData, livestream)

         handleNext()
      } catch (e) {
         errorLogAndNotify(e)
      }
      setJoiningTalentPool(false)
      dataLayerLivestreamEvent(
         AnalyticsEvents.EventRegistrationTalentpoolJoin,
         livestream
      )
   }
   if (!livestream) return null

   return (
      <div className={classes.root}>
         <Grid
            justifyContent="center"
            className={classes.gridContainer}
            container
         >
            <Grid className={classes.imgGrid} item sm={4}>
               <Grow
                  timeout={1000}
                  // @ts-ignore
                  direction="right"
                  in
               >
                  <div className={classes.imgWrapper}>
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={connectedIcon} alt="talent pool illustration" />
                  </div>
               </Grow>
            </Grid>
            <Grid className={classes.details} item xs={12} sm={8}>
               <GroupLogo logoUrl={livestream.companyLogoUrl} />
               <DialogTitle
                  // @ts-ignore
                  align="center"
               >
                  Join the {livestream.company} Talent Pool
               </DialogTitle>
               <DialogContent>
                  <DialogContentText align="center">
                     Join {livestream.company}&apos;s Talent Pool and be
                     contacted directly in case any relevant opportunity arises
                     for you at {livestream.company} in the future. By joining
                     the Talent Pool, you agree that your profile data will be
                     shared with {livestream.company}. Don&apos;t worry, you can
                     leave a Talent Pool at any time.
                  </DialogContentText>
               </DialogContent>
               <DialogActions className={classes.actions}>
                  <Button
                     variant="text"
                     disabled={joiningTalentPool}
                     size="large"
                     onClick={() => {
                        handleNext()
                        dataLayerLivestreamEvent(
                           AnalyticsEvents.EventRegistrationTalentpoolSkip,
                           livestream
                        )
                     }}
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
                        joiningTalentPool ? (
                           <CircularProgress size={10} color="inherit" />
                        ) : null
                     }
                     disabled={joiningTalentPool}
                  >
                     Join Talent Pool
                  </Button>
               </DialogActions>
            </Grid>
         </Grid>
      </div>
   )
}

export default TalentPoolJoin
