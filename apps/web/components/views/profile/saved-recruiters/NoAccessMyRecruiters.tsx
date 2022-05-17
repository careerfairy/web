import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import {
   Grid,
   ListItem,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import Image from "next/image"
import Link from "../../common/Link"
import List from "@mui/material/List"
import CheckIcon from "@mui/icons-material/Check"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import React from "react"
import { useAuth } from "../../../../HOCs/AuthProvider"

export const NoAccessMyRecruiters = () => {
   const { userStats, userData } = useAuth()
   const requiredBadge: Badge = UserPresenter.saveRecruitersRequiredBadge()

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
                     alt="Access denied illustration"
                  />
               </Box>

               <Typography
                  sx={{ color: "text.secondary", textAlign: "center" }}
                  variant="h6"
               >
                  You need to unlock the{" "}
                  <Link href="#">{requiredBadge.name} Badge</Link> to access
                  this feature.
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
                  {requiredBadge.requirements.map((r, i) => (
                     <ListItem key={i}>
                        <ListItemIcon sx={{ minWidth: "30px" }}>
                           {r.isComplete(userData, userStats) ? (
                              <CheckIcon color="success" />
                           ) : (
                              <RadioButtonUncheckedIcon />
                           )}
                        </ListItemIcon>
                        <ListItemText
                           primary={r.description}
                           sx={{ color: "text.secondary" }}
                        />
                     </ListItem>
                  ))}
               </List>
            </Grid>
         </Grid>
      </>
   )
}
