import { styles } from "./profileStyles"
import {
   Grid,
   ListItem,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import React from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { useAuth } from "../../../HOCs/AuthProvider"
import Image from "next/image"
import List from "@mui/material/List"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import { Badge } from "@careerfairy/shared-lib/dist/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"

const MyRecruitersTab = ({ userData }) => {
   const { userPresenter } = useAuth()

   return (
      <Container component="main" maxWidth="md">
         <Box boxShadow={1} p={4} sx={styles.box}>
            <Grid container spacing={2}>
               <Grid item xs={8}>
                  <Typography sx={{ color: "text.secondary" }} variant="h5">
                     Your Saved Recruiters
                  </Typography>
               </Grid>
            </Grid>

            <p>
               During a Livestream event you can save your favourite recruiters
               and they will appear here.
            </p>

            {userPresenter.canSaveRecruiters() && <p>show</p>}

            {!userPresenter.canSaveRecruiters() && (
               <NoAccess userPresenter={userPresenter} />
            )}
         </Box>
      </Container>
   )
}

const NoAccess = ({ userPresenter }: { userPresenter: UserPresenter }) => {
   const requiredBadge: Badge = userPresenter.saveRecruitersRequiredBadge()

   return (
      <>
         <Grid container>
            <Grid item xs={12} mt={2}>
               <Typography
                  mb={2}
                  sx={{ color: "text.secondary", textAlign: "center" }}
                  variant="h6"
               >
                  Oops! You {"don't"} have access to this feature yet..
               </Typography>

               <Box sx={{ textAlign: "center" }} mb={3}>
                  <Image
                     src="/illustrations/undraw_access_denied_re_awnf.svg"
                     width="600"
                     height="200"
                  />
               </Box>

               <Typography
                  sx={{ color: "text.secondary", textAlign: "center" }}
                  variant="h6"
               >
                  You need to unlock the{" "}
                  <strong>{requiredBadge.name} Badge</strong> to access this
                  feature.
               </Typography>
               <Typography
                  sx={{ color: "text.secondary", textAlign: "center" }}
                  variant="subtitle1"
               >
                  {"Here's"} what you need to do to get access:
               </Typography>
            </Grid>
         </Grid>
         <Grid container alignItems="center" justifyContent="center">
            <Grid item>
               <List>
                  <ListItem>
                     <ListItemIcon sx={{ minWidth: "30px" }}>
                        <RadioButtonUncheckedIcon />
                     </ListItemIcon>
                     <ListItemText
                        primary={requiredBadge.achievementDescription}
                        sx={{ color: "text.secondary" }}
                     />
                  </ListItem>
               </List>
            </Grid>
         </Grid>
      </>
   )
}

export default MyRecruitersTab
