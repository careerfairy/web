import { Box, Button, Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import GroupPlansDialog from "../GroupPlansDialog"
import { sxStyles } from "types/commonTypes"
import GroupSparksPlanDesktopSelector from "./components/GroupSparksPlanDesktopSelector"
import { useSelector } from "react-redux"
import { plansDialogOpenSelector } from "store/selectors/groupSelectors"
import { FormEvent } from "react"
import SkeletonSelectSparksPlan from "./skeletons/GroupPlanSkeletonView"
import useStripePlanCheckout from "components/custom-hook/stripe/useStripePlanCheckout"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      backgroundColor: "#F6F6FA",
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
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   checkoutWrapper: {
      mt: 2,
      alignItems: "center",
      direction: "column",
      spacing: 2,
   },
   checkoutDescription: {
      color: (theme) => theme.palette.neutral[600],
      textAlign: "center",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "20px",
   },
})

const SelectSparksPlanView = () => {
   const open = useSelector(plansDialogOpenSelector)
   return (
      <SuspenseWithBoundary fallback={<SkeletonSelectSparksPlan open={open} />}>
         <View />
      </SuspenseWithBoundary>
   )
}

const View = () => {
   const { disabled, redirectToCheckout } = useStripePlanCheckout()

   return <GroupPlans disabled={disabled} handleSelect={redirectToCheckout} />
}

type GroupPlansProps = {
   disabled: boolean
   handleSelect: (e: FormEvent) => void
}

const GroupPlans = (props: GroupPlansProps) => {
   return (
      <GroupPlansDialog.Container>
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
            <Stack sx={styles.checkoutWrapper}>
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

export default SelectSparksPlanView
