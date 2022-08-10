import { Button, Typography, Box, CircularProgress } from "@mui/material"
import React, { useEffect, useState } from "react"
import {
   formatInterests,
   InterestsChipsSelector,
   InterestsSelectedState,
   interestsSubmitHandler,
   userInterestsDidNotChange,
} from "../../../signup/personaliseInformation/InterestsSelector"
import { useDispatch } from "react-redux"
import ContentCardTitle from "../../../../../layouts/UserLayout/ContentCardTitle"

const UserInterests = ({ userData }) => {
   const [isLoading, setLoading] = useState(false)
   const [isEditable, setEditable] = useState(false)
   const [interests, setInterests] = useState<InterestsSelectedState>({})
   const dispatch = useDispatch()

   const handleSubmit = async () => {
      setLoading(true)
      await interestsSubmitHandler(
         interests,
         userData?.id,
         dispatch,
         userData?.interestsIds
      )
      setLoading(false)
   }

   useEffect(() => {
      if (
         userInterestsDidNotChange(
            formatInterests(interests),
            userData?.interestsIds
         )
      ) {
         setEditable(false)
      } else {
         setEditable(true)
      }
   }, [userData, interests])

   return (
      <>
         <ContentCardTitle gutterBottom>Interests</ContentCardTitle>
         <Typography variant="body2" component="p">
            Select 5 to improve your site experience:
         </Typography>

         <Box my={3}>
            <InterestsChipsSelector
               interests={interests}
               setInterests={setInterests}
            />
         </Box>

         <Box style={{ textAlign: "center" }}>
            <Button
               variant="contained"
               color="primary"
               disabled={!isEditable || isLoading}
               startIcon={
                  isLoading && <CircularProgress size={20} color="inherit" />
               }
               onClick={handleSubmit}
            >
               Update
            </Button>
         </Box>
      </>
   )
}

export default UserInterests
