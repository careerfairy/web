import { styles } from "./profileStyles"
import {
   CardHeader,
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
import { Badge } from "@careerfairy/shared-lib/dist/badges/badges"
import UserPresenter from "@careerfairy/shared-lib/dist/users/UserPresenter"
import CheckIcon from "@mui/icons-material/Check"
import Link from "../common/Link"
import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import Card from "@mui/material/Card"
import IconButton from "@mui/material/IconButton"
import ColorizedAvatar from "../common/ColorizedAvatar"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import DeleteIcon from "@mui/icons-material/Delete"

const MyRecruitersTab = () => {
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

            <Box mb={3}>
               <p>
                  During a Livestream event you can save your favourite
                  recruiters and they will appear here.
               </p>
            </Box>

            {userPresenter.canSaveRecruiters() && <RecruiterList />}

            {!userPresenter.canSaveRecruiters() && (
               <NoAccess userPresenter={userPresenter} />
            )}
         </Box>
      </Container>
   )
}

const data = [
   {
      id: "sdfsdf",
      livestreamId: "livestream-id-1",
      userId: "user-id-1",
      savedAt: new Date(),
      livestreamDetails: {
         title: "Livestream 1",
         company: "Facebook",
         summary: "Livestream 1 description",
         start: new Date(),
         companyLogoUrl:
            "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2F043996e8-e633-4351-9e04-5a4714ddf3ca_091386.jpg?alt=media",
      },
      streamerDetails: {
         id: "sdf",
         avatar: null,
         linkedIn: "https://www.linkedin.com/in/james-bond-1/",
         firstName: "Carlos",
         lastName: "Florencio",
         position: "Dev",
         background: "Dev",
      },
   },
]

const RecruiterList = () => {
   return (
      <Box>
         {data.map((recruiter, i) => (
            <Box mb={2} key={i}>
               <RecruiterCard
                  // @ts-ignore
                  recruiter={recruiter}
               />
            </Box>
         ))}
      </Box>
   )
}

const RecruiterCard = ({ recruiter }: { recruiter: SavedRecruiter }) => {
   return (
      <Card>
         <CardHeader
            avatar={
               <ColorizedAvatar
                  firstName={recruiter.streamerDetails.firstName}
                  lastName={recruiter.streamerDetails.lastName}
                  imageUrl={recruiter.streamerDetails.avatar}
               />
            }
            action={
               <Box>
                  <IconButton aria-label="settings">
                     <LinkedInIcon style={{ color: "#0E76A8" }} />
                  </IconButton>
                  <IconButton aria-label="settings">
                     <DeleteIcon />
                  </IconButton>
               </Box>
            }
            title={`${recruiter.streamerDetails.firstName} ${recruiter.streamerDetails.lastName}`}
            subheader={`${recruiter.streamerDetails.position} - ${recruiter.livestreamDetails.company}`}
         />
      </Card>
   )
}

const NoAccess = ({ userPresenter }: { userPresenter: UserPresenter }) => {
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
                           {r.isComplete(userPresenter.model) ? (
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

export default MyRecruitersTab
