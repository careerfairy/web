import CloseIcon from "@mui/icons-material/CloseRounded"
import { Box, IconButton, Button, Stack } from "@mui/material"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { sxStyles } from "types/commonTypes"
import { closeGroupPlansDialog } from "store/reducers/groupPlanReducer"
import {
   clientSecret,
   plansDialogOpenSelector,
} from "store/selectors/groupSelectors"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import SelectGroupPlanMobileView from "../views/SelectGroupPlanMobileView"
import GroupPlanCheckoutMobileView from "../views/GroupPlanCheckoutMobileView"
import React from "react"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import GroupPlanSkeletonMobile from "./skeletons/GroupPlanSkeletonMobileView"
import BrandedSwipableDrawer from "components/views/common/inputs/BrandedSwipeableDrawer"
import useStripePlanCheckout from "components/custom-hook/stripe/useStripePlanCheckout"

const mobileBreakpoint = "md"

const styles = sxStyles({
   mobilePaperRoot: { maxHeight: "95%", backgroundColor: "#F6F6FA" },
   closeBtn: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 2,
      pt: {
         xs: 2.5,
         [mobileBreakpoint]: 2.125,
      },
      pr: {
         xs: 2,
         [mobileBreakpoint]: 2.5,
      },
      color: "text.primary",
      "& svg": {
         width: 32,
         height: 32,
         color: "text.primary",
      },
   },
   mobileWrapper: {
      px: "15px",
      mb: "10px",
      backgroundColor: "#F6F6FA",
   },
   footer: {
      px: {
         xs: 2,
         [mobileBreakpoint]: 2.5,
      },
      mb: 2,
      color: "text.primary",
      "& svg": {
         width: 32,
         height: 32,
         color: "text.primary",
      },
   },
   checkoutButton: {
      zIndex: 10,
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
      width: "100%",
      color: "white.100",
      textAlign: "center",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "24px",
   },
   cancelButton: {
      color: (theme) => theme.palette.black[700],
      zIndex: 10,
   },
   swipableDrawer: {
      maxHeight: "90%",
   },
})

const GroupPlansMobileView = () => {
   const open = useSelector(plansDialogOpenSelector)
   return (
      <SuspenseWithBoundary fallback={<GroupPlanSkeletonMobile open={open} />}>
         <View />
      </SuspenseWithBoundary>
   )
}
const View = () => {
   const generatedClientSecret = useSelector(clientSecret)
   const open = useSelector(plansDialogOpenSelector)

   const dispatch = useDispatch()

   const { disabled, redirectToCheckout } = useStripePlanCheckout()

   const handleCloseGroupPlansDialog = useCallback(
      (forceClose: boolean = false) => {
         dispatch(
            closeGroupPlansDialog({
               forceClose,
            })
         )
      },
      [dispatch]
   )

   return (
      <BrandedSwipableDrawer
         sx={styles.swipableDrawer}
         open={open}
         onOpen={() => {}}
         PaperProps={{
            sx: styles.mobilePaperRoot,
         }}
         transitionDuration={600}
         onClose={() => handleCloseGroupPlansDialog()}
      >
         <Box sx={styles.closeBtn}>
            <IconButton onClick={() => handleCloseGroupPlansDialog()}>
               <CloseIcon />
            </IconButton>
         </Box>
         <Stack
            direction={"column"}
            justifyContent={"space-around"}
            sx={styles.mobileWrapper}
         >
            <ConditionalWrapper
               condition={Boolean(generatedClientSecret)}
               fallback={<SelectGroupPlanMobileView />}
            >
               <GroupPlanCheckoutMobileView />
            </ConditionalWrapper>

            <ConditionalWrapper condition={Boolean(!generatedClientSecret)}>
               <Box sx={styles.footer}>
                  <Stack
                     direction={"column"}
                     spacing={1}
                     alignContent={"center"}
                     justifyItems={"center"}
                     alignItems={"center"}
                     width={"100%"}
                  >
                     <Button
                        disabled={disabled}
                        color={"secondary"}
                        onClick={redirectToCheckout}
                        sx={styles.checkoutButton}
                        size="large"
                     >
                        Select plan
                     </Button>
                     <Box>
                        <Button
                           color={"grey"}
                           onClick={() => handleCloseGroupPlansDialog()}
                           sx={styles.cancelButton}
                           size="large"
                        >
                           Cancel
                        </Button>
                     </Box>
                  </Stack>
               </Box>
            </ConditionalWrapper>
         </Stack>
      </BrandedSwipableDrawer>
   )
}

export default GroupPlansMobileView
