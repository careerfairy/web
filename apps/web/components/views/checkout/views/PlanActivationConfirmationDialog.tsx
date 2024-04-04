import { Box, Button, Dialog, Stack, Typography } from "@mui/material"
import useStripeSessionStatus from "components/custom-hook/stripe/useStripeSessionStatus"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
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
   closeButton: {
      minWidth: "95%",
      borderRadius: "20px",
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
   const replaceUrl = asPath.replace("stripe_session_id=".concat(sessionId), "")

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
            fallback={<PaymentFailureComponent />}
         >
            <PaymentSuccessComponent handleClose={closeDialog} />
         </ConditionalWrapper>
      </Dialog>
   )
}

const PaymentFailureComponent = () => {
   return <>error: todo view</>
}

type PaymentSuccessComponentProps = {
   handleClose: () => void
}

const PaymentSuccessComponent = ({
   handleClose,
}: PaymentSuccessComponentProps) => {
   return (
      <Stack
         direction={"column"}
         alignItems={"end"}
         sx={styles.dialogContentWrapper}
         spacing={2}
      >
         <Stack alignItems={"center"} spacing={1}>
            <Box sx={styles.imageWrapper} />
            <Typography variant="brandedH3" sx={styles.messageTitle}>
               Your Sparks Advanced plan is now active!
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
