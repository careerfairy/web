import { BaseFetchStripeCustomerSession } from "@careerfairy/shared-lib/stripe/types"
import {
   Box,
   CircularProgress,
   Dialog,
   IconButton,
   Stack,
   Typography,
} from "@mui/material"
import { useStripeCustomerSession } from "components/custom-hook/stripe/useStripeCustomerSession"
import useIsMobile from "components/custom-hook/useIsMobile"
import StripeCheckoutComponent from "components/views/checkout/forms/StripeCheckoutComponent"
import BrandedSwipeableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import { SlideUpTransition } from "components/views/common/transitions"
import { ReactNode } from "react"
import { X } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   mobilePaper: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      width: "100vw",
      maxWidth: "100vw",
      height: "90vh",
      maxHeight: "90vh",
   },
   desktopPaper: {
      display: "flex",
      p: "24px 32px",
      flexDirection: "column",
      maxHeight: "80vh",
      overflow: "auto",
   },
   stripeWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "100%",
      overflow: "auto",
      pb: 2,
      backgroundColor: "background.default",
      borderRadius: "12px",
   },
   title: {
      color: "neutral.800",
      fontWeight: 700,
      textAlign: "center",
   },
   subtitle: {
      color: "neutral.800",
      textAlign: "center",
      px: {
         xs: 2,
         sm: 2,
         md: 0,
      },
   },
   closeButton: {
      position: "absolute",
      top: "16px",
      right: "16px",
      cursor: "pointer",
   },
})
/**
 * Creates a new customer session in Stripe shows the checkout details.
 *
 * @param checkoutData - The data to create a customer session in Stripe
 * @ex
 * @param onClose - The function to close the dialog
 * @param onOpen - The function to open the dialog
 * @param title - The title of the dialog
 * @param subtitle - The subtitle of the dialog
 */

type Props<T extends BaseFetchStripeCustomerSession> = {
   checkoutData: T
   open: boolean // Explicitly set as a request to stripe is being made to create a customer session
   onClose: () => void
   onOpen: () => void
   title: string
   subtitle: string
}

export const CheckoutDialog = <T extends BaseFetchStripeCustomerSession>({
   open,
   onClose,
   onOpen,
   checkoutData,
   title,
   subtitle,
}: Props<T>) => {
   const { data: sessionData, isLoading } =
      useStripeCustomerSession(checkoutData)

   const isMobile = useIsMobile()

   const CloseButton = (
      <IconButton sx={styles.closeButton} onClick={onClose}>
         <X size={24} />
      </IconButton>
   )

   if (isMobile) {
      return (
         <BrandedSwipeableDrawer
            open={open}
            onClose={onClose}
            onOpen={onOpen}
            PaperProps={{
               sx: styles.mobilePaper,
            }}
         >
            <CheckoutDetails
               clientSecret={sessionData?.customerSessionSecret}
               title={title}
               subtitle={subtitle}
               isLoading={isLoading}
            />
         </BrandedSwipeableDrawer>
      )
   }
   return (
      <Dialog
         open={open}
         onClose={onClose}
         PaperProps={{
            sx: styles.desktopPaper,
         }}
         maxWidth="md"
         fullWidth
         TransitionComponent={SlideUpTransition}
      >
         <CheckoutDetails
            clientSecret={sessionData?.customerSessionSecret}
            title={title}
            subtitle={subtitle}
            isLoading={isLoading}
            closeButton={CloseButton}
         />
      </Dialog>
   )
}

type CheckoutDetailsProps = {
   clientSecret: string
   title: string
   subtitle: string
   closeButton?: ReactNode
   isLoading?: boolean
}

const CheckoutDetails = ({
   clientSecret,
   title,
   subtitle,
   closeButton,
   isLoading,
}: CheckoutDetailsProps) => {
   const CheckoutComponent = clientSecret ? (
      <StripeCheckoutComponent clientSecret={clientSecret} />
   ) : null

   return (
      <>
         {closeButton}
         <Stack spacing={2} alignItems="center">
            <Stack spacing={0.5}>
               <Typography variant="brandedH2" sx={styles.title}>
                  {title}
               </Typography>
               <Typography variant="medium" sx={styles.subtitle}>
                  {subtitle}
               </Typography>
            </Stack>
            {Boolean(isLoading) && <CircularProgress />}
            <Box sx={styles.stripeWrapper}>{CheckoutComponent}</Box>
         </Stack>
      </>
   )
}
