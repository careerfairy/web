import React from "react"
import Stack from "@mui/material/Stack"
import { darken } from "@mui/material"
import Link from "../common/Link"
import { wishListBorderRadius } from "../../../constants/pages"
import CreateWishDialog from "./CreateWishDialog"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import useDialog from "../../custom-hook/useDialog"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getMaxLineStyles } from "../../helperFunctions/HelperFunctions"
import UserAvatar from "../common/UserAvatar"

const styles: StylesProps = {
   paper: {
      height: "100%",
      borderRadius: wishListBorderRadius,
      position: "relative",
      cursor: "pointer",
      "&:hover": {
         "& .prompt": {
            backgroundColor: darken("#EFF5F8", 0.1),
         },
      },
   },
   link: {
      position: "absolute",
      inset: 0,
   },
   avatar: {},
   prompt: {
      flex: 1,
      borderRadius: wishListBorderRadius,
      backgroundColor: "#EFF5F8",
      display: "flex",
      alignItems: "center",
      color: "text.secondary",
      p: 2,
      transition: (theme) => theme.transitions.create("background-color"),
   },
   promptText: {
      ...getMaxLineStyles(1),
   },
}
const CreateWishButton = () => {
   const { isLoggedOut } = useAuth()
   const { asPath } = useRouter()
   const [createWishDialogOpen, handleOpenWishDialog, handleCloseWishDialog] =
      useDialog()
   return (
      <>
         <Stack
            onClick={() => !isLoggedOut && handleOpenWishDialog()}
            sx={styles.paper}
            direction={"row"}
            alignItems={"center"}
            spacing={1}
         >
            <UserAvatar size={"medium"} />
            <Box className={"prompt"} sx={styles.prompt}>
               <Typography sx={styles.promptText}>
                  What would you like to wish for?
               </Typography>
            </Box>
            {isLoggedOut && (
               <Box
                  href={{
                     pathname: "login",
                     query: {
                        absolutePath: asPath,
                     },
                  }}
                  sx={styles.link}
                  component={Link}
               />
            )}
         </Stack>
         <CreateWishDialog
            onClose={handleCloseWishDialog}
            open={createWishDialogOpen}
         />
      </>
   )
}

export default CreateWishButton
