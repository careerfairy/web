import React, { useContext } from "react"
import {
   Box,
   Button,
   DialogActions,
   DialogContent,
   Divider,
   Grow,
   Stack,
   Typography,
} from "@mui/material"
import { RegistrationContext } from "../../../../../../context/registration/RegistrationContext"
import SuccessCheckmark from "./SuccessCheckmark"
import { useRouter } from "next/router"
import { StylesProps } from "../../../../../../types/commonTypes"
import ReferralPrompt from "../../../ReferralPrompt"

const styles: StylesProps = {
   root: {},
   title: {
      color: "white",
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
      backgroundColor: "primary.main",
   },
   titleWrapper: {
      paddingTop: 2,
   },
   actionsWrapper: {
      p: 2,
      width: "100%",
   },
}

const RegistrationComplete = () => {
   const {
      group,
      livestream,
      promptOtherEventsOnFinal,
      handleClose,
      onFinish,
   } = useContext(RegistrationContext)
   const {
      query: { groupId, referrerId },
      push,
   } = useRouter()

   function handleUrl() {
      return {
         pathname: group?.id
            ? `/next-livestreams/${group?.id}`
            : groupId
            ? `/next-livestreams/${groupId}`
            : "/next-livestreams",
         query: {
            ...(referrerId && { referrerId }),
            ...(livestream?.id && {
               livestreamId: livestream.id,
            }),
         },
      }
   }

   const handleFinish = () => {
      onFinish?.()
      handleClose?.()
   }

   return (
      <>
         <DialogContent sx={styles.content}>
            <SuccessCheckmark />
            <Grow timeout={1000} in>
               <Box sx={styles.titleWrapper}>
                  <Typography variant="h5" align="center" sx={styles.title}>
                     Thank you!
                  </Typography>
               </Box>
            </Grow>
         </DialogContent>
         <DialogActions>
            <Stack divider={<Divider />} spacing={2} sx={styles.actionsWrapper}>
               <ReferralPrompt
                  subtitle={
                     "You have successfully completed your first step towards " +
                     "becoming a member of the community. You can share the event " +
                     "with your network!"
                  }
                  title={"Congratulations"}
                  event={livestream}
               />
               <Box sx={styles.actions}>
                  {promptOtherEventsOnFinal ? (
                     <Button
                        sx={styles.linkBtn}
                        color="primary"
                        onClick={async () => {
                           handleFinish()
                           push(handleUrl())
                        }}
                        variant="contained"
                        size="large"
                     >
                        See all our events
                     </Button>
                  ) : (
                     <Button
                        variant="contained"
                        size="large"
                        onClick={handleFinish}
                        color="primary"
                        autoFocus
                     >
                        Finish
                     </Button>
                  )}
               </Box>
            </Stack>
         </DialogActions>
      </>
   )
}

export default RegistrationComplete
