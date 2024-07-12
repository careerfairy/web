import { SavedRecruiter } from "@careerfairy/shared-lib/users"
import { CardHeader, Grid, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import Skeleton from "@mui/material/Skeleton"
import { DefaultTheme } from "@mui/styles"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"
import { My_Recruiters_NoAccess } from "../../../../constants/contextInfoCareerSkills"
import { userRepo } from "../../../../data/RepositoryInstances"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import Link from "../../common/Link"
import NoAccessView from "../../common/NoAccessView"
import { styles } from "../profileStyles"
import { RecruiterCard } from "./RecruiterCard"

const MyRecruitersTab = () => {
   const { userPresenter } = useAuth()

   return (
      <ContentCard>
         <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
               <ContentCardTitle>Your Saved Recruiters</ContentCardTitle>
            </Grid>

            <Grid item xs={12} lg={8}>
               <Typography sx={styles.subtitle}>
                  During a live stream event you can save your favourite
                  recruiters and they will appear here.
               </Typography>
            </Grid>
         </Grid>

         <BrowseButton />

         {userPresenter.canSaveRecruiters() && (
            <RecruiterList userEmail={userPresenter.model.userEmail} />
         )}

         {!userPresenter.canSaveRecruiters() && (
            <NoAccessView contextInfoMapKey={My_Recruiters_NoAccess} />
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

   if (recruiters.length === 0) return <EmptyList />

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

const EmptyList = () => {
   return (
      <>
         <Grid item xs={12} lg={8}>
            <Card
               sx={{
                  padding: 2,
                  boxShadow: (theme: DefaultTheme) =>
                     theme.legacy.boxShadows.dark_8_25_10,
               }}
            >
               <Typography mb={2} sx={{ fontWeight: "bold" }}>
                  Unfortunately you haven’t saved any recruiter yet.
               </Typography>
               <Typography mb={2}>
                  Click on {`"`}Browse events{`"`} to find interesting events to
                  follow. Then save the profile of the recruiters with whom you
                  want to keep contact. Their profile will appear on this page.
               </Typography>
            </Card>
         </Grid>
      </>
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

const BrowseButton = () => {
   return (
      <Box mt={4} mb={4}>
         <Button
            component={Link}
            href={"/next-livestreams"}
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
   )
}

export default MyRecruitersTab
