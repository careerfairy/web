import { SavedRecruiter } from "@careerfairy/shared-lib/dist/users"
import Card from "@mui/material/Card"
import {
   CardActions,
   CardHeader,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from "@mui/material"
import ColorizedAvatar from "../../common/ColorizedAvatar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import React, { useCallback, useState } from "react"
import Link from "../../common/Link"
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined"
import { useAuth } from "../../../../HOCs/AuthProvider"
import Image from "next/image"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { sxStyles } from "../../../../types/commonTypes"
import { userRepo } from "../../../../data/RepositoryInstances"
import { makeLivestreamEventDetailsUrl } from "@careerfairy/shared-lib/src/utils/urls"

const styles = sxStyles({
   name: {
      fontStyle: "normal",
      fontWeight: 500,
      fontSize: "18px",
      lineHeight: "18px",
      color: "#212020",
      marginBottom: "6px",
   },
   position: {
      fontStyle: "italic",
      fontWeight: 300,
      fontSize: "14px",
      color: "#212020",
      marginBottom: "3px",
   },
   streamDetails: {
      fontStyle: "normal",
      fontWeight: 300,
      fontSize: "12px",
      color: "rgba(33, 32, 32, 0.6)",
   },
   linkedInButton: {
      padding: 0,
      marginLeft: "10px",
   },
})

export const RecruiterCard = ({
   recruiter,
   handleRemoveRecruiter,
}: {
   recruiter: SavedRecruiter
   handleRemoveRecruiter: (recruiter: SavedRecruiter) => void
}) => {
   const [anchorEl, setAnchorEl] = useState(null)
   const {
      userData: { userEmail },
   } = useAuth()

   const handleCloseMenu = useCallback(() => setAnchorEl(null), [])

   const handleOpenMenu = useCallback((event) => {
      setAnchorEl(event.currentTarget)
   }, [])

   const handleDeleteRecruiter = useCallback(async () => {
      try {
         await userRepo.removeSavedRecruiter(userEmail, recruiter.id)
         handleRemoveRecruiter(recruiter)
      } catch (e) {
         console.error(e)
      }
   }, [recruiter, userEmail])

   return (
      <Card>
         <CardHeader
            sx={{
               alignItems: "start",
            }}
            avatar={
               <ColorizedAvatar
                  sx={{
                     width: "70px",
                     height: "70px",
                  }}
                  firstName={recruiter.streamerDetails.firstName}
                  lastName={recruiter.streamerDetails.lastName}
                  imageUrl={recruiter.streamerDetails.avatar}
               />
            }
            title={
               <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={styles.name}>
                     {recruiter.streamerDetails.firstName}{" "}
                     {recruiter.streamerDetails.lastName}
                  </Typography>

                  {recruiter.streamerDetails.linkedIn && (
                     <IconButton
                        component={Link}
                        noLinkStyle
                        href={recruiter.streamerDetails.linkedIn}
                        target="_blank"
                        aria-label="linkedin"
                        sx={styles.linkedInButton}
                     >
                        <Image
                           src="/icons/linkedin-circle.svg"
                           width={25}
                           height={25}
                           alt="LinkedIn"
                        />
                     </IconButton>
                  )}
               </Box>
            }
            subheader={
               <Box>
                  <Typography sx={styles.position}>
                     {recruiter.streamerDetails.position}
                  </Typography>

                  <Typography sx={styles.streamDetails}>
                     {recruiter.livestreamDetails.title ? (
                        <span>
                           Saved from {recruiter.livestreamDetails.title}{" "}
                        </span>
                     ) : (
                        <span>Saved </span>
                     )}
                     on {recruiter.savedAt?.toDate().toLocaleDateString()}
                  </Typography>

                  <Box mt={2}>
                     <Link
                        href={makeLivestreamEventDetailsUrl(
                           recruiter.livestreamId
                        )}
                        color="secondary"
                        sx={{
                           textDecoration: "none",
                           display: "flex",
                           alignItems: "center",
                        }}
                     >
                        <OpenInNewIcon />{" "}
                        <span style={{ marginLeft: "4px" }}>
                           To the event page
                        </span>
                     </Link>
                  </Box>
               </Box>
            }
            action={
               <IconButton aria-label="settings" onClick={handleOpenMenu}>
                  <MoreVertIcon />
               </IconButton>
            }
         />
         <CardActions sx={{ padding: 0 }}>
            <Menu
               id="card-options-menu"
               anchorEl={anchorEl}
               open={Boolean(anchorEl)}
               onClose={handleCloseMenu}
               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
               <MenuItem onClick={handleDeleteRecruiter}>
                  <ListItemIcon>
                     <DeleteOutlineOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
               </MenuItem>
            </Menu>
         </CardActions>
      </Card>
   )
}
