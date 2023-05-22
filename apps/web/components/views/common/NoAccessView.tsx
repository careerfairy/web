import {
   Grid,
   ListItem,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import Image from "next/image"
import Link from "../common/Link"
import List from "@mui/material/List"
import CheckIcon from "@mui/icons-material/Check"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"
import React, { useMemo } from "react"
import {
   badgeName,
   careerSkillsLinkWithContext,
} from "../../../constants/contextInfoCareerSkills"
import { ContextInfoMap } from "../../../constants/contextInfoCareerSkills"
import { useAuth } from "../../../HOCs/AuthProvider"

interface Props {
   contextInfoMapKey: keyof typeof ContextInfoMap
}

const NoAccessView = ({ contextInfoMapKey }: Props) => {
   const { badgeRequired, noAccessViewTitle } = useMemo(
      () => ContextInfoMap[contextInfoMapKey],
      [contextInfoMapKey]
   )
   const { userStats } = useAuth()

   return (
      <>
         <Grid container>
            <Grid item xs={12} mt={2}>
               <Typography
                  mb={2}
                  sx={{ color: "text.secondary", textAlign: "center" }}
                  variant="h6"
               >
                  {noAccessViewTitle}
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
                  <Link
                     href={careerSkillsLinkWithContext(contextInfoMapKey)}
                     color="secondary"
                  >
                     {badgeName(badgeRequired)} badge
                  </Link>{" "}
                  to access this feature.
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
                  {badgeRequired.requirements.map((r, i) => (
                     <ListItem key={i}>
                        <ListItemIcon sx={{ minWidth: "30px" }}>
                           {r.isComplete(userStats) ? (
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

export default NoAccessView
