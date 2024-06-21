import { Box, Button, Stack, Typography, tooltipClasses } from "@mui/material"
import { useCallback } from "react"
import {
   EyeOff as HiddenIcon,
   Info as InfoIcon,
   Eye as VisibleIcon,
} from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { toggleShowHiddenSparks } from "../../../../../../store/reducers/adminSparksReducer"
import { sparksShowHiddenSparks } from "../../../../../../store/selectors/adminSparksSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupSparks from "../../../../../custom-hook/spark/useGroupSparks"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import DividerWithText from "../../../../common/misc/DividerWithText"
import BrandedTooltip from "../../../../common/tooltips/BrandedTooltip"
import CreateSparkButton from "../../components/CreateSparkButton"
import GetInspiredButton from "../../components/GetInspiredButton"
import SparksCounter from "./SparksCounter"
import TrialModeNotice from "./TrialModeNotice/TrialModeNotice"

const styles = sxStyles({
   root: {
      boxShadow: "0px 0px 24px 0px rgba(20, 20, 20, 0.08)",
      borderRadius: 4,
      overflow: "hidden",
   },
   mobileRoot: {
      bgcolor: "background.paper",
      p: 2,
      borderRadius: 4,
      alignItems: "center",
      boxShadow: "0px 0px 8px 0px rgba(20, 20, 20, 0.06)",
      border: "1px solid #F9F9F9",
   },
   mobileProgressIndicator: {
      p: 2,
      borderRadius: (theme) => theme.spacing(0, 0, 4, 4),
      alignItems: "center",
      justifyContent: "center",
   },
   btn: {
      textTransform: "none",
   },
   getInspiredBtnWrapper: {
      "& svg": {
         color: "#BCBCBC",
      },
   },
   mobileGetInspiredBtn: {
      textDecoration: "underline",
      color: "#939393",
      fontSize: "1.14286rem",
      "& svg": {
         width: "1.71429rem",
         height: "1.71429rem",
      },
   },
   tooltip: {
      maxWidth: 350,
      [`& .${tooltipClasses.tooltip}`]: {
         maxWidth: 350,
      },
   },
})
const HeaderActions = () => {
   const isMobile = useIsMobile()
   const { group, groupPresenter } = useGroup()

   const maxPublicSparks = groupPresenter.getMaxPublicSparks()

   const isTrialPlan = groupPresenter.isTrialPlan()

   const { data: publicSparks } = useGroupSparks(group.groupId, {
      isPublished: true,
      limit: maxPublicSparks,
   })

   const hasReachedMaxSparks = groupPresenter.hasReachedMaxSparks(
      publicSparks.length
   )

   const isCriticalState =
      publicSparks.length >= maxPublicSparks - 2 && !hasReachedMaxSparks

   if (isMobile) {
      return (
         <Stack spacing={5.5}>
            <Box
               sx={styles.root}
               bgcolor={isCriticalState ? "#FFE8E8" : "#FAFAFE"}
            >
               <Stack sx={styles.mobileRoot} spacing={1}>
                  <CreateSparkButton>Upload a new Spark</CreateSparkButton>
                  <DividerWithText maxWidth={"50%"}>
                     <Typography variant="xsmall" color="neutral.200">
                        Or
                     </Typography>
                  </DividerWithText>
                  <Stack
                     sx={styles.getInspiredBtnWrapper}
                     spacing={1.25}
                     alignItems="center"
                     direction="row"
                  >
                     <GetInspiredButton
                        sx={styles.mobileGetInspiredBtn}
                        variant="text"
                        color="grey"
                        size="small"
                     />
                     <InfoTooltip />
                  </Stack>
               </Stack>
               {group.plan ? (
                  <Stack
                     spacing={2}
                     direction="row"
                     sx={styles.mobileProgressIndicator}
                  >
                     <SparksCounter
                        isCriticalState={isCriticalState}
                        publicSparks={publicSparks}
                        maxPublicSparks={maxPublicSparks}
                     />
                     <TrialModeNotice />
                  </Stack>
               ) : null}
            </Box>

            {isTrialPlan ? null : (
               <span>
                  <ToggleHiddenSparksButton />
               </span>
            )}
         </Stack>
      )
   }

   return (
      <Stack spacing={2} direction="row" justifyContent="space-between">
         {group.plan ? (
            <Stack spacing={2} direction="row" alignItems="center">
               <SparksCounter
                  isCriticalState={isCriticalState}
                  publicSparks={publicSparks}
                  maxPublicSparks={maxPublicSparks}
               />
               <TrialModeNotice />
            </Stack>
         ) : (
            <Box component="span">
               <ToggleHiddenSparksButton />
            </Box>
         )}

         <Stack
            sx={styles.getInspiredBtnWrapper}
            spacing={1.25}
            alignItems="center"
            direction="row"
         >
            {group.publicSparks && !isTrialPlan ? (
               <ToggleHiddenSparksButton />
            ) : null}
            <GetInspiredButton />
            <InfoTooltip />
         </Stack>
      </Stack>
   )
}

const ToggleHiddenSparksButton = () => {
   const dispatch = useDispatch()

   const showHiddenSparks = useSelector(sparksShowHiddenSparks)

   const handleToggleHiddenSparks = useCallback(() => {
      dispatch(toggleShowHiddenSparks())
   }, [dispatch])

   return (
      <Button
         sx={styles.btn}
         onClick={handleToggleHiddenSparks}
         startIcon={showHiddenSparks ? <HiddenIcon /> : <VisibleIcon />}
         variant="outlined"
         color="secondary"
      >
         {showHiddenSparks ? "Don’t show hidden videos" : "Show hidden videos"}
      </Button>
   )
}

const InfoTooltip = () => {
   return (
      <BrandedTooltip
         title={
            "Lacking ideas for your content? We collected talent's most requested questions to inspire you."
         }
         sx={styles.tooltip}
      >
         <InfoIcon />
      </BrandedTooltip>
   )
}

export default HeaderActions
