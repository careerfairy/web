import { Box, Button, CircularProgress, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useGroup } from "layouts/GroupDashboardLayout"
import GroupPlansDialog, { useSparksPlansForm } from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import GroupSparksPlanDesktopSelector from "./components/GroupSparksPlanDesktopSelector"
import { useSelector } from "react-redux"
import { selectedPlanSelector } from "store/selectors/groupSelectors"
import { FormEvent } from "react"
import GroupSparksPlanMobileSelector from "./components/GroupSparksPlanMobileSelector"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAuth } from "HOCs/AuthProvider"
import useStripeCustomerSession from "components/custom-hook/stripe/useStripeCustomerSession"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
   },
   contentMobile: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
   },
   contentMobileWrapper: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
   },
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
      width: "276px",
      color: (theme) => theme.brand.white[100],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   checkoutWrapper: {
      mt: 2,
      alignItems: "center",
   },
   cancelButton: {
      color: (theme) => theme.palette.black[700],
   },
   checkoutDescription: {
      color: (theme) => theme.palette.neutral[600],
      textAlign: "center",
      fontFamily: "Poppins",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
   },
})

const SelectSparksPlanView = () => {
   return (
      <SuspenseWithBoundary fallback={<CircularProgress />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const isMobile = useIsMobile("md")
   const { authenticatedUser } = useAuth()
   const { group } = useGroup()
   const { goToCheckoutView: goToSelectPlanView, setClientSecret } =
      useSparksPlansForm()

   const selectedPlan = useSelector(selectedPlanSelector)

   const { customerSessionSecret: customerSessionSecret } =
      useStripeCustomerSession(group, selectedPlan, authenticatedUser.email)

   const disabled = !selectedPlan || !customerSessionSecret
   const redirectToCheckout = async (e: FormEvent) => {
      e.preventDefault()

      setClientSecret(customerSessionSecret)
      goToSelectPlanView(selectedPlan)
   }

   return (
      <ConditionalWrapper
         condition={isMobile}
         fallback={
            <GroupPlans disabled={disabled} handleSelect={redirectToCheckout} />
         }
      >
         <GroupPlansMobile
            disabled={disabled}
            handleSelect={redirectToCheckout}
         />
      </ConditionalWrapper>
   )
}

type GroupPlansProps = {
   disabled: boolean
   handleSelect: (e: FormEvent) => void
}

const GroupPlans = (props: GroupPlansProps) => {
   return (
      <GroupPlansDialog.Container sx={{}}>
         <GroupPlansDialog.Content sx={styles.content}>
            <GroupPlansDialog.Title>
               Select your{" "}
               <Box component="span" color="secondary.main">
                  Sparks
               </Box>{" "}
               plan
            </GroupPlansDialog.Title>
            <GroupPlansDialog.Subtitle>
               Tailored offers that best suit YOUR needs.
            </GroupPlansDialog.Subtitle>
            <Box mt={5} />
            <Box
               mt={{
                  md: 0,
               }}
            />

            <GroupSparksPlanDesktopSelector />

            <Box
               mb={{
                  xs: "auto",
                  md: 0,
               }}
            />
            <Stack direction={"column"} spacing={2} sx={styles.checkoutWrapper}>
               <Box>
                  <Button
                     disabled={props.disabled}
                     color={"secondary"}
                     onClick={props.handleSelect}
                     sx={styles.checkoutButton}
                  >
                     Select plan
                  </Button>
               </Box>
               <Box sx={styles.checkoutDescription}>
                  Content available for 1 year
               </Box>
            </Stack>
         </GroupPlansDialog.Content>
      </GroupPlansDialog.Container>
   )
}

const GroupPlansMobile = (props: GroupPlansProps) => {
   const { handleClose } = useSparksPlansForm()

   return (
      <GroupPlansDialog.Container sx={{}}>
         <GroupPlansDialog.Content sx={styles.contentMobile}>
            <GroupPlansDialog.Title>
               Select your{" "}
               <Box component="span" color="secondary.main">
                  Sparks
               </Box>{" "}
               plan
            </GroupPlansDialog.Title>
            <Box mt={5} />
            <Box
               mt={{
                  md: 0,
               }}
            />

            <Box sx={styles.contentMobileWrapper}>
               <GroupSparksPlanMobileSelector />

               <Box
                  mb={{
                     xs: "auto",
                     md: 0,
                  }}
               />
               <Stack
                  direction={"column"}
                  spacing={2}
                  sx={styles.checkoutWrapper}
               >
                  <Box
                     sx={styles.checkoutDescription}
                     display={"flex"}
                     width={"100%"}
                     alignContent={"start"}
                  >
                     Content available for 1 year
                  </Box>
               </Stack>
            </Box>
            <Box mt={15} />
            <Stack
               direction={"column"}
               spacing={2}
               alignItems={"center"}
               width={"100%"}
            >
               <Box>
                  <Button
                     disabled={props.disabled}
                     color={"secondary"}
                     onClick={props.handleSelect}
                     sx={styles.checkoutButton}
                  >
                     Select plan
                  </Button>
               </Box>
               <Box>
                  <Button
                     color={"grey"}
                     onClick={() => handleClose()}
                     sx={styles.cancelButton}
                  >
                     Cancel
                  </Button>
               </Box>
            </Stack>
         </GroupPlansDialog.Content>
      </GroupPlansDialog.Container>
   )
}

export default SelectSparksPlanView
