import { Grid, Typography } from "@mui/material"
import React from "react"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import Box from "@mui/material/Box"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import { createStyles } from "@mui/styles"
import { styles as profileStyles } from "../profileStyles"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { SkillsStepper } from "./SkillsStepper"

const styles = createStyles({
   laneTitle: {
      fontWeight: 700,
      fontSize: "1.5rem",
   },
   step: {
      "& .MuiStepLabel-iconContainer": {
         backgroundColor: "black",
      },
   },
})

const CareerSkills = () => {
   return (
      <ContentCard>
         <Grid container spacing={2} mb={4}>
            <Grid item xs={8}>
               <ContentCardTitle>My Career Skills</ContentCardTitle>
            </Grid>

            <Grid item xs={8}>
               <Box>
                  <Typography sx={profileStyles.subtitle}>
                     Boost your career by leveraging powerful features inside
                     our platform. Check the requirements of each level to know
                     how to progress. By reaching more advanced levels{" "}
                     {"you'll"} get more benefits and standout from the crowd!
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <Box mb={4}>Placeholder for context info</Box>

         <Box mb={4} display="flex" alignItems="center">
            <Typography sx={styles.laneTitle}>Research</Typography>

            <InfoOutlinedIcon sx={{ marginLeft: "10px" }} />
         </Box>

         <Grid container>
            <Grid item xs={8}>
               <SkillsStepper />
            </Grid>
         </Grid>
      </ContentCard>
   )
}

// const IconContainer = ({ children }) => {
//    return <InfoOutlinedIcon />
// }

export default CareerSkills
