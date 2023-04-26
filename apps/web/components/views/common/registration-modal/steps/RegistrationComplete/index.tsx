import React, { useContext, useEffect } from "react"
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   Grow,
   Stack,
   Typography,
} from "@mui/material"
import { RegistrationContext } from "../../../../../../context/registration/RegistrationContext"
import { useRouter } from "next/router"
import { StylesProps } from "../../../../../../types/commonTypes"
import ReferralWidget from "../../../ReferralWidget"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import { PillsBackground } from "materialUI/GlobalBackground/GlobalBackGround"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import useEventSocials from "../../../../../custom-hook/useEventSocials"
import { responsiveConfetti } from "../../../../../util/confetti"

const styles: StylesProps = {
   root: {},
   linkBtn: {
      textDecoration: "none !important",
   },
   actions: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
   },
   actionsWrapper: {
      p: 2,
      width: "100%",
   },
   actionMessage: {
      mb: 4,
      mt: {
         xs: 1,
         sm: 4,
      },
   },
   shareMessage: {
      mx: { xs: 0, sm: "10%" },
      mb: { xs: 1, sm: 2 },
   },
   actionButton: {
      display: "flex",
      justifyContent: "center",
   },
   confettiIcon: {
      display: "flex",
      justifyContent: "center",
      fontSize: { xs: "40px", sm: "70px" },
      marginTop: { xs: 0, sm: 4 },
   },
}

const RegistrationComplete = () => {
   const { livestream, promptOtherEventsOnFinal, handleClose, onFinish } =
      useContext(RegistrationContext)
   const { userStats } = useAuth()
   const { push } = useRouter()
   const isMobile = useIsMobile()
   const socials = useEventSocials(livestream)

   const handleFinish = () => {
      onFinish?.()
      handleClose?.()
   }

   useEffect(() => {
      if (!userStats?.hasRegisteredOnAnyLivestream) {
         responsiveConfetti(isMobile)
      }
   }, [isMobile, userStats?.hasRegisteredOnAnyLivestream])

   return (
      <PillsBackground minHeight={"fit-content"} isOnDialog={true}>
         <DialogContent sx={{ pb: 2 }}>
            <Box sx={styles.confettiIcon}>🎉</Box>
            <Grow timeout={1000} in>
               <Box>
                  <Typography variant="h6" align="center">
                     Thanks for registering!
                  </Typography>
               </Box>
            </Grow>
         </DialogContent>
         <DialogActions>
            <Stack spacing={2} sx={styles.actionsWrapper}>
               <Box>
                  <Typography
                     variant="h6"
                     align="center"
                     sx={styles.shareMessage}
                  >
                     {!userStats?.hasRegisteredOnAnyLivestream
                        ? "You have successfully completed your first step towards becoming a member of the community. You can share the live stream with your network!"
                        : "That’s one more step as active member of this community. You can share the live stream with your network!"}
                  </Typography>
                  <ReferralWidget
                     socials={socials}
                     noBackgroundColor
                     iconsColor={"primary"}
                     justifyContent={"center"}
                     iconStyle={{ height: "32px", padding: 0 }}
                  />
               </Box>
               <Box sx={styles.actions}>
                  <Typography
                     variant="h5"
                     align="center"
                     sx={styles.actionMessage}
                  >
                     Did you know? <br />
                     You can now check our <b>CareerFairy platform</b> to see
                     more live streams like this
                  </Typography>

                  <Box sx={styles.actionButton}>
                     {promptOtherEventsOnFinal ? (
                        <Button
                           sx={styles.linkBtn}
                           color="secondary"
                           onClick={async () => {
                              handleFinish()
                              await push("/next-livestreams")
                           }}
                           variant="contained"
                           size="large"
                        >
                           {isMobile ? "See" : "Discover"} more live streams
                        </Button>
                     ) : (
                        <Button
                           variant="contained"
                           size="large"
                           onClick={handleFinish}
                           color="secondary"
                           autoFocus
                        >
                           Finish
                        </Button>
                     )}
                  </Box>
               </Box>
            </Stack>
         </DialogActions>
      </PillsBackground>
   )
}

export default RegistrationComplete
