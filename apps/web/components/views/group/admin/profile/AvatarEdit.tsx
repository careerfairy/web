import React from "react"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { sxStyles } from "../../../../../types/commonTypes"
import Avatar from "@mui/material/Avatar"
import { Button } from "@mui/material"
import Stack from "@mui/material/Stack"

const styles = sxStyles({
   ava: {
      width: 145,
      height: 145,
      fontSize: "4em",
      outline: "solid 5px",
      outlineOffset: -6,
      bgcolor: "primary.main",
      "& img": {
         objectFit: "contain",
      },
   },
})
const AvatarEdit = () => {
   const { userPresenter } = useAuth()

   return (
      <Stack alignItems={"center"} spacing={2}>
         <Avatar
            sx={styles.ava}
            alt={userPresenter.getDisplayName()}
            src={userPresenter.getAvatar()}
         >
            {userPresenter.getInitials()}
         </Avatar>
         <Button variant={"contained"}>CHANGE AVATAR</Button>
      </Stack>
   )
}

export default AvatarEdit
