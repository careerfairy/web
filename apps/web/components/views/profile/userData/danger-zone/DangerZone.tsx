import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"

import * as actions from "store/actions"
import { Grid, Link, Typography } from "@mui/material"
import { StylesProps, sxStyles } from "../../../../../types/commonTypes"
import DeleteAccountDialog from "./DeleteAccountDialog"
import { deleteUserFailSelector } from "../../../../../store/selectors/authSelectors"
import { useSnackbar } from "notistack"
import { GENERAL_ERROR } from "components/util/constants"

const styles: StylesProps = sxStyles({
   section: {
      marginBottom: 1,
   },
   subtitle: {
      textTransform: "uppercase",
      fontSize: "0.8rem !important",
      fontWeight: "bold",
   },
})

type Props = {
   userEmail: string
}

const DangerZone = ({ userEmail }: Props) => {
   const [isDeleteOverlayOpen, setIsDeleteOverlayOpen] = useState(false)
   const deletionError = useSelector(deleteUserFailSelector)
   const { enqueueSnackbar } = useSnackbar()
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
         enqueueSnackbar(GENERAL_ERROR, {
            variant: "error",
            preventDuplicate: true,
         })
      }
   }, [dispatch, enqueueSnackbar, router])

   return (
      <>
         <Grid sx={styles.section}>
            <Typography sx={styles.subtitle} variant="h5">
               Wish to no longer join the events?
            </Typography>
            <Typography variant="body2" component="p">
               Once you delete your Account, there is no going back. Please be
               certain.
            </Typography>
         </Grid>
         <Link
            href="#"
            underline="always"
            data-testid="delete-account-button"
            color="error"
            onClick={() => setIsDeleteOverlayOpen(true)}
         >
            Delete my account
         </Link>
         {isDeleteOverlayOpen && (
            <DeleteAccountDialog
               userEmail={userEmail}
               onAccountDeletion={handleAccountDeletion}
               onClose={setIsDeleteOverlayOpen}
               data-testid={"delete-account-dialog"}
            />
         )}
      </>
   )
}

export default DangerZone
