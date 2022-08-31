// @flow
import * as React from "react"
import UserResume from "../../../profile/userData/user-resume/UserResume"
import { useContext, useEffect } from "react"
import { RegistrationContext } from "../../../../../context/registration/RegistrationContext"
import {
   Button,
   DialogActions,
   DialogContent,
   DialogTitle,
   Typography,
} from "@mui/material"
import { useAuth } from "../../../../../HOCs/AuthProvider"

const styles = {
   root: {
      textTransform: "uppercase",
      fontWeight: "800",
   },
   title: {
      textAlign: "center",
      fontWeight: 800,
   },
   subtitle: {
      textAlign: "center",
   },
} as const

const UserResumeSelect = ({}) => {
   const { handleNext, handleClose, livestream, verifyResumeRequirement } =
      useContext(RegistrationContext)
   const { userData } = useAuth()

   useEffect(() => {
      verifyResumeRequirement()
   }, [livestream?.id, livestream?.withResume])

   return (
      <>
         <DialogTitle sx={styles.title}>
            Share your resume with {livestream?.company}
         </DialogTitle>
         <DialogContent>
            <Typography p={1} sx={styles.subtitle}>
               Participants are required to share their resume with the
               organizers in order to join this event.
            </Typography>
            <UserResume userData={userData} outsideProfile={true} />
         </DialogContent>
         <DialogActions>
            <Button size="large" color="grey" onClick={handleClose}>
               Cancel
            </Button>
            <Button
               disabled={!userData?.userResume}
               variant="contained"
               size="large"
               onClick={handleNext}
               color="primary"
               autoFocus
            >
               Next
            </Button>
         </DialogActions>
      </>
   )
}

export default UserResumeSelect
