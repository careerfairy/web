import { Box, Button, Stack, tooltipClasses } from "@mui/material"
import useIsMobile from "../../../../../custom-hook/useIsMobile"
import DividerWithText from "../../../../common/misc/DividerWithText"
import BrandedTooltip from "../../../../common/tooltips/BrandedTooltip"
import { useCallback, useMemo } from "react"
import {
   EyeOff as HiddenIcon,
   Info as InfoIcon,
   Eye as VisibleIcon,
} from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import { toggleShowHiddenSparks } from "../../../../../../store/reducers/adminSparksReducer"
import { sparksShowHiddenSparks } from "../../../../../../store/selectors/adminSparksSelectors"
import { sxStyles } from "../../../../../../types/commonTypes"
import CreateSparkButton from "../../components/CreateSparkButton"
import GetInspiredButton from "../../components/GetInspiredButton"
import useGroupSparks from "../../../../../custom-hook/spark/useGroupSparks"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import SparksCounter from "./SparksCounter"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

const styles = sxStyles({
   mobileRoot: {
      bgcolor: "background.paper",
      p: 2,
      borderRadius: 4,
      alignItems: "center",
   },
   mobileProgressIndicator: {
      p: 2,
      mt: -1,
      borderRadius: (theme) => theme.spacing(0, 0, 4, 4),
      alignItems: "center",
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
   const { group } = useGroup()
   const { data: publicSparks } = useGroupSparks(group.groupId, {
      isPublished: true,
      limit: GroupPresenter.createFromDocument(group).getMaxPublicSparks(),
   })

   const maxPublicSparks = useMemo(
      () => GroupPresenter.createFromDocument(group).getMaxPublicSparks(),
      [group]
   )
   const isCriticalState = useMemo(
      () => publicSparks.length >= maxPublicSparks - 2,
      [maxPublicSparks, publicSparks.length]
   )

   if (isMobile) {
      return (
         <Stack spacing={5.5}>
            <Box>
               <Stack sx={styles.mobileRoot} spacing={1}>
                  <CreateSparkButton>Upload a new Spark</CreateSparkButton>
                  <DividerWithText maxWidth={"50%"}>Or</DividerWithText>
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
               {group.publicSparks ? (
                  <Stack
                     sx={styles.mobileProgressIndicator}
                     bgcolor={isCriticalState ? "#FFE8E8" : "#F0EDFD"}
                  >
                     <SparksCounter
                        isCriticalState={isCriticalState}
                        publicSparks={publicSparks}
                        maxPublicSparks={maxPublicSparks}
                     />
                  </Stack>
               ) : null}
            </Box>

            <span>
               <ToggleHiddenSparksButton />
            </span>
         </Stack>
      )
   }

   return (
      <Stack spacing={2} direction="row" justifyContent="space-between">
         {group.publicSparks ? (
            <SparksCounter
               isCriticalState={isCriticalState}
               publicSparks={publicSparks}
               maxPublicSparks={maxPublicSparks}
            />
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
            {group.publicSparks ? <ToggleHiddenSparksButton /> : null}
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
