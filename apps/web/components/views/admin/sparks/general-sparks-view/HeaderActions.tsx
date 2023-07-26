import { Box, Button, Stack, tooltipClasses } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import DividerWithText from "components/views/common/misc/DividerWithText"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { useCallback } from "react"
import {
   EyeOff as HiddenIcon,
   Info as InfoIcon,
   Eye as VisibleIcon,
} from "react-feather"
import { useDispatch, useSelector } from "react-redux"
import { toggleShowHiddenSparks } from "store/reducers/adminSparksReducer"
import { sparksShowHiddenSparks } from "store/selectors/adminSparksSelectors"
import { sxStyles } from "types/commonTypes"
import CreateSparkButton from "../components/CreateSparkButton"
import GetInspiredButton from "../components/GetInspiredButton"

const styles = sxStyles({
   mobileRoot: {
      bgcolor: "background.paper",
      p: 2,
      borderRadius: 4,
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

   if (isMobile) {
      return (
         <Stack spacing={5.5}>
            <Stack sx={styles.mobileRoot} spacing={1}>
               <CreateSparkButton>Create a new Spark</CreateSparkButton>
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
            <span>
               <ToggleHiddenSparksButton />
            </span>
         </Stack>
      )
   }

   return (
      <Stack spacing={2} direction="row" justifyContent="space-between">
         <Box component="span">
            <ToggleHiddenSparksButton />
         </Box>
         <Stack
            sx={styles.getInspiredBtnWrapper}
            spacing={1.25}
            alignItems="center"
            direction="row"
         >
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
