import React, { useCallback, useState } from "react"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"

import * as actions from "store/actions"
import { Button, Grid, Typography } from "@mui/material"
import { StylesProps, sxStyles } from "../../../../../types/commonTypes"
import DeleteAccountDialog from "./DeleteAccountDialog"

const styles: StylesProps = sxStyles({
   submitBtn: {
      margin: "unset",
   },
   section: {
      marginTop: "unset",
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
      marginBottom: 1,
   },
})

type Props = {
   userEmail: string
}

const DangerZone = ({ userEmail }: Props) => {
   const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false)
   const router = useRouter()
   const dispatch = useDispatch()

   const handleAccountDeletion = useCallback(async () => {
      try {
         await dispatch(actions.deleteUser())

         await router.push({
            pathname: "/login",
         })
      } catch (e) {
         console.error(e)
      }
   }, [dispatch, router])

   return (
      <Grid container spacing={2} sx={styles.section}>
         <Grid item xs={12} sm={8}>
            <Typography sx={styles.subtitle} variant="h5">
               Delete Account
            </Typography>
            <Typography variant="body2" component="p">
               Once you delete your Account, there is no going back. Please be
               certain.
            </Typography>
         </Grid>

         <Grid item xs={12} sm={4}>
            <Button
               type="button"
               fullWidth
               variant="outlined"
               color="error"
               sx={styles.submitBtn}
               onClick={() => setIsDeleteOverlayOpen(true)}
               data-testid={"delete-account-button"}
            >
               {"Delete Account"}
            </Button>
            {isDeleteOverlayOpen && (
               <DeleteAccountDialog
                  userEmail={userEmail}
                  onAccountDeletion={handleAccountDeletion}
                  onClose={setIsDeleteOverlayOpen}
                  data-testid={"delete-account-dialog"}
               />
            )}
         </Grid>
      </Grid>
   )
}

export default DangerZone
