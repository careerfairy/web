import { Box, Button, Dialog, Link, Stack, Typography } from "@mui/material"
import useStripeSessionStatus from "components/custom-hook/stripe/useStripeSessionStatus"
import useIsMobile from "components/custom-hook/useIsMobile"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import AlertCircleIcon from "components/views/common/icons/AlertCircleIcon"
import { SlideUpTransition } from "components/views/common/transitions"
import { useRouter } from "next/router"
import { useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   dialogPaperMobile: {
      minHeight: "100%",
      minWidth: "100%",
      justifyContent: "center",
      borderBottomLeftRadius: "0px",
      borderBottomRightRadius: "0px",
   },
   link: {
      color: (theme) => theme.palette.neutral[600],
   },
   dialogPaperDesktop: {
      p: "28px",
      justifyContent: "center",
   },
   container: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
   },
   containerMobile: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "end",
      mt: "220px",
   },
   dialogContentWrapper: {
      p: "15px",
   },
   messageTitle: {
      maxWidth: "350px",
      fontWeight: 700,
      textAlign: "center",
   },
   messageDescription: {
      maxWidth: "450px",
      fontWeight: 400,
      textAlign: "center",
      color: (theme) => theme.palette.neutral[400],
   },
   imageWrapper: {
      backgroundImage: "url('/Party-popper1.png')",
      width: "128.229px",
      height: "132px",
   },
   errorImageWrapper: {
      width: "108px",
      height: "108px",
      backgroundColor: (theme) => theme.brand.error[50],
      borderRadius: "50%",
      alignContent: "center",
   },
   closeButton: {
      minWidth: "95%",
      borderRadius: "20px",
   },
   alertIcon: {
      width: "76px",
      height: "76px",
      ml: "16px",
      mt: "6px",
   },
})

const PlanActivationConfirmationDialog = () => {
   const { query } = useRouter()

   const stripeSessionId = query.stripe_session_id as string

   return (
      <ConditionalWrapper condition={Boolean(stripeSessionId)}>
         <PaymentCompleteComponent sessionId={stripeSessionId} />
      </ConditionalWrapper>
   )
}

type PaymentCompleteComponentProps = {
   sessionId: string
}
const PaymentCompleteComponent = ({
   sessionId,
}: PaymentCompleteComponentProps) => {
   const { asPath, replace } = useRouter()
   // Replacing only this query string to prevent breaking other properties if needed
   const url = new URL(asPath, getBaseUrl())
   url.searchParams.delete("stripe_session_id")
   const replaceUrl = url.pathname + url.search

   const [isOpen, setIsOpen] = useState(true)
   const isMobile = useIsMobile()

   const { data: sessionStatus } = useStripeSessionStatus(sessionId)

   const showSuccess =
      Boolean(sessionStatus) &&
      sessionStatus.status == "complete" &&
      sessionStatus.paymentStatus == "paid"

   const closeDialog = () => {
      setIsOpen(false)
      replace(replaceUrl)
   }
   return (
      <Dialog
         sx={isMobile ? styles.containerMobile : styles.container}
         scroll="paper"
         open={isOpen}
         maxWidth={"md"}
         PaperProps={{
            sx: isMobile ? styles.dialogPaperMobile : styles.dialogPaperDesktop,
         }}
         TransitionComponent={SlideUpTransition}
      >
         <ConditionalWrapper
            condition={showSuccess}
            fallback={<PaymentFailureComponent handleClose={closeDialog} />}
         >
            <PaymentSuccessComponent handleClose={closeDialog} />
         </ConditionalWrapper>
      </Dialog>
   )
}

type PaymentDialogComponentProps = {
   handleClose: () => void
}

const PaymentFailureComponent = ({
   handleClose,
}: PaymentDialogComponentProps) => {
   return (
      <Stack
         direction={"column"}
         alignItems={"center"}
         sx={styles.dialogContentWrapper}
         spacing={2}
      >
         <Stack alignItems={"center"} spacing={1}>
            <Box sx={styles.errorImageWrapper}>
               <AlertCircleIcon sx={styles.alertIcon} />
            </Box>

            <Typography variant="brandedH3" sx={styles.messageTitle}>
               An error occurred
            </Typography>
            <Stack spacing={3}>
               <Typography variant="brandedBody" sx={styles.messageDescription}>
                  We{"'"}re sorry, but there seems to be a temporary issue
                  processing your purchase. Don{"'"}t worry, your payment
                  information is safe.
               </Typography>
               <Typography variant="brandedBody" sx={styles.messageDescription}>
                  If the issue persists, please contact us at{" "}
                  {
                     <Link href={"mailto:info@careerfairy.io"} sx={styles.link}>
                        info@careerfairy.io
                     </Link>
                  }{" "}
                  and we{"'"}ll be happy to help.
               </Typography>
            </Stack>
         </Stack>

         <Button
            sx={styles.closeButton}
            color="error"
            variant="contained"
            onClick={handleClose}
         >
            Try again later
         </Button>
      </Stack>
   )
}

const PaymentSuccessComponent = ({
   handleClose,
}: PaymentDialogComponentProps) => {
   const { query } = useRouter()

   const planName = query.planName as string
   return (
      <Stack
         direction={"column"}
         alignItems={"center"}
         sx={styles.dialogContentWrapper}
         spacing={2}
      >
         <Stack alignItems={"center"} spacing={1}>
            <Box sx={styles.imageWrapper} />
            <Typography variant="brandedH3" sx={styles.messageTitle}>
               Your Sparks {planName} plan is now active!
            </Typography>
            <Typography variant="brandedBody" sx={styles.messageDescription}>
               Discover the latest trends thanks to comprehensive Sparks
               analytics and engage even more your target audience by publishing
               additional Sparks.
            </Typography>
         </Stack>

         <Button
            sx={styles.closeButton}
            color="secondary"
            variant="contained"
            onClick={handleClose}
         >
            Start using your plan
         </Button>
      </Stack>
   )
}
export default PlanActivationConfirmationDialog
