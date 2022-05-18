import React from "react"
import Stack from "@mui/material/Stack"
import { darken } from "@mui/material"
import Link from "../common/Link"
import { wishListBorderRadius } from "../../../constants/pages"
import CreateOrEditWishDialog from "./CreateOrEditWishDialog"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useRouter } from "next/router"
import useDialog from "../../custom-hook/useDialog"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { getMaxLineStyles } from "../../helperFunctions/HelperFunctions"
import LoggedInUserAvatar from "../common/LoggedInUserAvatar"
import { HandleAddNewWishToHits } from "../../../pages/wishlist"

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

interface Props {
   handleAddNewWishToHits: HandleAddNewWishToHits
}
const CreateWishButton = ({ handleAddNewWishToHits }: Props) => {
   const { isLoggedIn } = useAuth()
   const { asPath } = useRouter()
   const [createWishDialogOpen, handleOpenWishDialog, handleCloseWishDialog] =
      useDialog()
   return (
      <>
         <Stack
            onClick={() => isLoggedIn && handleOpenWishDialog()}
            sx={styles.paper}
            direction={"row"}
            alignItems={"center"}
            spacing={1}
         >
            {isLoggedIn && <LoggedInUserAvatar size={"medium"} />}
            <Box className={"prompt"} sx={styles.prompt}>
               <Typography sx={styles.promptText}>
                  What would you like to wish for?
               </Typography>
            </Box>
            {!isLoggedIn && (
               <Box
                  href={{
                     pathname: "/login",
                     query: {
                        absolutePath: asPath,
                     },
                  }}
                  sx={styles.link}
                  component={Link}
               />
            )}
         </Stack>
         {createWishDialogOpen && (
            <CreateOrEditWishDialog
               onClose={handleCloseWishDialog}
               open={createWishDialogOpen}
               handleAddNewWishToHits={handleAddNewWishToHits}
            />
         )}
      </>
   )
}

export default CreateWishButton
