import React from "react"
import UserResume from "./user-resume/UserResume"
import PersonalInfo from "./personal-info/PersonalInfo"
import UserInterests from "./personalise/UserInterests"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import { Grid } from "@mui/material"
import { useAuth } from "../../../../HOCs/AuthProvider"

const UserData = () => {
   const { userData } = useAuth()

   return (
      <Grid container spacing={2}>
         <Grid item xs={12} lg={8}>
            <ContentCard>
               <PersonalInfo userData={userData} />
            </ContentCard>
         </Grid>
         <Grid item xs={12} lg={4}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <ContentCard>
                     <UserResume userData={userData} />
                  </ContentCard>
               </Grid>
               <Grid item xs={12}>
                  <ContentCard>
                     <UserInterests userData={userData} />
                  </ContentCard>
               </Grid>
            </Grid>
         </Grid>
      </Grid>
   )
}

export default UserData
