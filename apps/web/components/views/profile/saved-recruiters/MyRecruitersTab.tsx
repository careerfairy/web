import { CardHeader, Grid, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import Box from "@mui/material/Box"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Link from "../../common/Link"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import Button from "@mui/material/Button"
import { NoAccess } from "./NoAccess"
import { RecruiterCard } from "./RecruiterCard"
import Skeleton from "@mui/material/Skeleton"
import Card from "@mui/material/Card"
import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import userRepo from "../../../../data/firebase/UserRepository"
import { styles } from "../profileStyles"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"

const MyRecruitersTab = () => {
   const { userPresenter } = useAuth()

   return (
      <ContentCard>
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <ContentCardTitle>Your Saved Recruiters</ContentCardTitle>
            </Grid>

            <Grid item xs={8}>
               <Typography sx={styles.subtitle}>
                  During a Livestream event you can save your favourite
                  recruiters and they will appear here.
               </Typography>
            </Grid>
         </Grid>

         <Box mt={4} mb={4}>
            <Button
               component={Link}
               // @ts-ignore
               href={{
                  pathname: `/next-livestreams`,
               }}
               style={{ textDecoration: "none" }}
               color="secondary"
               variant="contained"
               sx={{
                  padding: "10px 40px",
               }}
            >
               Browse Events
            </Button>
         </Box>

         {userPresenter.canSaveRecruiters() && (
            <RecruiterList userEmail={userPresenter.model.userEmail} />
         )}

         {!userPresenter.canSaveRecruiters() && (
            <NoAccess userPresenter={userPresenter} />
         )}
      </ContentCard>
   )
}

const RecruiterList = ({ userEmail }) => {
   const [isLoading, setIsLoading] = useState(true)
   const [recruiters, setRecruiters] = useState<SavedRecruiter[]>(null)

   useEffect(() => {
      userRepo
         .getSavedRecruiters(userEmail)
         .then((recruiters) => {
            setRecruiters(recruiters)
         })
         .catch((err) => {
            console.error(err)
            setRecruiters([])
         })
         .finally(() => {
            setIsLoading(false)
         })
   }, [userEmail])

   const handleRemoveRecruiter = useCallback((recruiter: SavedRecruiter) => {
      setRecruiters((prevState) =>
         prevState.filter((rec) => rec.id !== recruiter.id)
      )
   }, [])

   if (isLoading) {
      return <LoadingSkeleton />
   }

   return (
      <Box>
         {recruiters.map((recruiter, i) => (
            <Box mb={2} key={i}>
               <RecruiterCard
                  // @ts-ignore
                  recruiter={recruiter}
                  handleRemoveRecruiter={handleRemoveRecruiter}
               />
            </Box>
         ))}
      </Box>
   )
}

const LoadingSkeleton = () => (
   <>
      <Box mb={4}>
         <Card>
            <CardHeader
               avatar={<Skeleton variant="circular" width={70} height={70} />}
               title={
                  <Skeleton
                     variant="text"
                     width="30%"
                     sx={{ marginBottom: "10px" }}
                  />
               }
               subheader={<Skeleton variant="text" width="50%" />}
            />
         </Card>
      </Box>
      <Box>
         <Card>
            <CardHeader
               avatar={<Skeleton variant="circular" width={70} height={70} />}
               title={
                  <Skeleton
                     variant="text"
                     width="30%"
                     sx={{ marginBottom: "10px" }}
                  />
               }
               subheader={<Skeleton variant="text" width="50%" />}
            />
         </Card>
      </Box>
   </>
)

export default MyRecruitersTab
