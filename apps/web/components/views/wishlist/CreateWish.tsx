import React from "react"
import Paper from "@mui/material/Paper"
import { Styles } from "../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import Avatar from "@mui/material/Avatar"
import { useAuth } from "../../../HOCs/AuthProvider"
import { stringAvatar } from "../../../util/CommonUtil"
import { Button, TextField } from "@mui/material"
import Link from "../common/Link"
import { useRouter } from "next/router"
import { wishListBorderRadius } from "../../../constants/pages"
import useDialog from "../../custom-hook/useDialog"
import CreateWishDialog from "./CreateWishDialog"

const styles: Styles = {
   paper: {
      p: 1,
      borderRadius: wishListBorderRadius,
   },
   textField: {
      flex: 1,
   },
}
const CreateWish = () => {
   const { userData, isLoggedOut } = useAuth()
   const { asPath } = useRouter()
   const [createWishDialogOpen, handleOpenWishDialog, handleCloseWishDialog] =
      useDialog()
   return (
      <>
         <Paper
            onClick={handleOpenWishDialog}
            sx={styles.paper}
            variant={"outlined"}
         >
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
               {isLoggedOut ? (
                  <Button
                     component={Link}
                     // @ts-ignore
                     href={{
                        pathname: "login",
                        query: {
                           absolutePath: asPath,
                        },
                     }}
                  >
                     Login to create a wish
                  </Button>
               ) : (
                  <>
                     <Avatar
                        // src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                        src={userData?.avatarUrl}
                        component={Link}
                        noLinkStyle
                        href={"/profile"}
                        {...stringAvatar(
                           `${userData?.firstName} ${userData?.lastName}`
                        )}
                     />
                     <TextField
                        label="Create Wish"
                        sx={styles.textField}
                        variant="outlined"
                        name="title"
                        InputLabelProps={{
                           shrink: false,
                        }}
                        InputProps={{
                           readOnly: true,
                           sx: {
                              borderRadius: wishListBorderRadius,
                           },
                        }}
                     />
                  </>
               )}
            </Stack>
         </Paper>
         <CreateWishDialog
            onClose={handleCloseWishDialog}
            open={createWishDialogOpen}
         />
      </>
   )
}

export default CreateWish
