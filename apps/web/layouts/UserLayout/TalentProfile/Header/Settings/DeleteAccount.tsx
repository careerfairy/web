import { Button, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useSnackbarNotifications from "components/custom-hook/useSnackbarNotifications"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { Trash } from "react-feather"
import { useDispatch } from "react-redux"
import { deleteUser } from "store/actions/authActions"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"

const styles = sxStyles({
   root: {
      mx: {
         md: 0,
         sm: 1,
         xs: 1,
      },
   },
   termsAndConditionsLink: {
      color: "info.600",
      fontWeight: 400,
      textDecoration: "underline",
      textUnderlineOffset: "2px",
   },
})
export const DeleteAccount = () => {
   const [showConfirmation, setShowConfirmation] = useState(false)

   return (
      <Stack sx={styles.root} spacing={4}>
         <ConditionalWrapper
            condition={!showConfirmation}
            fallback={<DeleteAccountConfirmation />}
         >
            <Typography variant="small" color="neutral.600" fontWeight={400}>
               Once you delete your account, all of your information and content
               will be permanently removed from our servers. This includes your
               profile, jobs, friends and progress.
            </Typography>
            <Button
               onClick={() => setShowConfirmation(true)}
               startIcon={<Trash size={18} />}
               variant="contained"
               color="error"
            >
               Delete account
            </Button>
         </ConditionalWrapper>
      </Stack>
   )
}

const DeleteAccountConfirmation = () => {
   const { userData } = useAuth()
   const [deleteAccountConfirmation, setDeleteAccountConfirmation] =
      useState("")
   const { errorNotification } = useSnackbarNotifications()
   const router = useRouter()
   const dispatch = useDispatch()

   const handleAccountDeletion = useCallback(async () => {
      try {
         await dispatch(deleteUser())

         await router.push({
            pathname: "/login",
         })
      } catch (error) {
         errorNotification(
            "There was an error deleting your account, please try again later."
         )
         errorLogAndNotify(
            error,
            `Error deleting account, authId: ${userData?.authId}`
         )
      }
   }, [dispatch, router, userData?.authId, errorNotification])

   const confirmed = deleteAccountConfirmation === "Delete"

   return (
      <Stack spacing={2.5}>
         <Stack spacing={2}>
            <Typography variant="small" color="neutral.600" fontWeight={400}>
               This action {<Cannot />} be undone. This will permanently delete
               the {userData?.userEmail} account.
            </Typography>
            <Typography variant="small" color="neutral.600" fontWeight={400}>
               Are you sure you want to delete your account? If you do, all your
               data will be removed within the period defined in our{" "}
               {<TermsAndConditionsLink />}.
            </Typography>
            <Typography variant="small" color="neutral.600" fontWeight={400}>
               To confirm, type ”Delete” below:
            </Typography>
         </Stack>
         <BrandedTextField
            name="deleteAccountConfirmation"
            label="Confirmation"
            placeholder="Type “Delete” to confirm"
            value={deleteAccountConfirmation}
            onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
         />
         <Button
            startIcon={<Trash size={18} />}
            variant="contained"
            color="error"
            disabled={!confirmed}
            onClick={handleAccountDeletion}
         >
            Delete account
         </Button>
      </Stack>
   )
}

const TermsAndConditionsLink = () => {
   return (
      <Link href="/terms" target="_blank">
         <Typography variant="small" sx={styles.termsAndConditionsLink}>
            Terms and Conditions
         </Typography>
      </Link>
   )
}

const Cannot = () => {
   return (
      <Typography variant="small" color="neutral.700" fontWeight={600}>
         CANNOT
      </Typography>
   )
}
