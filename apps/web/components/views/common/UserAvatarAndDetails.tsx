import React from "react"
import { StylesProps } from "types/commonTypes"
import ColorizedAvatar from "./ColorizedAvatar"
import { useAuth } from "../../../HOCs/AuthProvider"
import { Divider, Tooltip, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import ResumeIcon from "@mui/icons-material/PictureAsPdf"
import BadgeIcon from "./BadgeIcon"
import BadgeButton from "./BadgeButton"
import Link from "./Link"
import { useRouter } from "next/router"
const styles: StylesProps = {
   root: {
      width: "100%",
   },
   avatar: {
      width: 145,
      height: 145,
      fontSize: "4em",
      outline: "solid 5px #fff",
      outlineOffset: -10,
      "& img": {
         objectFit: "contain",
      },
   },
   linkedinIcon: {
      color: "#0077b5",
   },
   name: {
      fontSize: "1.5em",
      fontWeight: "bold",
      whiteSpace: "pre-wrap",
   },
}
const UserAvatarAndDetails = () => {
   const { userData, userPresenter } = useAuth()
   const router = useRouter()
   return (
      <Stack alignItems={"center"} spacing={2} sx={styles.root}>
         <ColorizedAvatar
            lastName={userData?.lastName}
            firstName={userData?.firstName}
            sx={styles.avatar}
         />
         <Typography sx={styles.name} align="center" variant="h5">
            {userData?.firstName} {userData?.lastName}
         </Typography>
         {(userData?.linkedinUrl ||
            userData?.userResume ||
            userPresenter?.badges?.hasAnyBadge()) && (
            <Stack
               direction="row"
               divider={<Divider orientation="vertical" flexItem />}
               spacing={2}
               justifyContent="center"
            >
               {userPresenter?.badges?.hasAnyBadge() && (
                  <BadgeButton
                     badge={userPresenter?.badges?.getOneBadge()}
                     iconButton
                     onClick={() => {
                        void router.push(`/profile/career-skills`)
                     }}
                     buttonProps={{ sx: { padding: 0 } }}
                  />
               )}
               {userData?.linkedinUrl && (
                  <a
                     href={userData.linkedinUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <LinkedInIcon sx={styles.linkedinIcon} />
                  </a>
               )}
               {userData?.userResume && (
                  <a
                     href={userData.userResume}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <Tooltip arrow title="Download Resume" placement="top">
                        <ResumeIcon color={"secondary"} />
                     </Tooltip>
                  </a>
               )}
            </Stack>
         )}
      </Stack>
   )
}

export default UserAvatarAndDetails
