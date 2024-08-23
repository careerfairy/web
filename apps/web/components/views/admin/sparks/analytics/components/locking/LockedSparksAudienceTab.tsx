import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import GroupPlansDialog from "components/views/checkout/GroupPlansDialog"
import UpgradePlanButton from "components/views/checkout/forms/UpgradePlanButton"
import LockedIcon from "components/views/common/icons/LockedIcon"
import Image from "next/image"
import React from "react"
import { Unlock } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1,
      borderRadius: 2,
      mx: {
         xs: "10px",
         sm: "45px",
      },
      mt: {
         xs: "10px",
         sm: "21px",
      },
   },
   infoWrapper: {
      bgcolor: "#FCFCFE",
      borderRadius: 2,
      boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
      p: {
         xs: 2.5,
         sm: 4,
      },
      mx: 2,
      maxWidth: 552,
      zIndex: 1,
   },
   lockedIcon: {
      color: "secondary.main",
      width: {
         xs: 56,
         sm: 64,
      },
      height: {
         xs: 56,
         sm: 64,
      },
   },
   heading: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   title: {
      textAlign: "center",
      fontWeight: 700,
      fontSize: {
         xs: "1.428rem",
         sm: "1.714rem",
      },
   },
   text: {
      textAlign: "center",
      fontSize: "1.142rem",
   },
   metrics: {
      color: "secondary.main",
      fontWeight: 600,
      fontSize: "1.142rem",
      textAlign: "center",
      listStylePosition: "inside", // Ensure bullets are inside the content flow
      p: 0,
      "& span": {
         position: "relative",
         left: -8,
      },
   },
})
const lockedSparkAnalyticsDesktopImage =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-locked-background.png?alt=media&token=f724cb9e-1a8d-4891-a56c-432039935835"
const lockedSparkAnalyticsMobileImage =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-locked-background-mobile.png?alt=media&token=22923a7d-9b9c-4eeb-90df-43e5624bac0e"

const metrics = ["Top countries", "Top universities", "Top field of studies"]

export const LockedSparksAudienceTab = () => {
   const isMobile = useIsMobile()

   const src = isMobile
      ? lockedSparkAnalyticsMobileImage
      : lockedSparkAnalyticsDesktopImage

   return (
      <Box sx={styles.root} data-testid="locked-spark-audiences">
         <Image src={src} alt="locked spark audiences" fill objectFit="cover" />
         <Info />
      </Box>
   )
}

const Info = () => {
   return (
      <Stack spacing={2} sx={styles.infoWrapper}>
         <Stack spacing={1} sx={styles.heading}>
            <LockedIcon sx={styles.lockedIcon} />
            <Typography component="h3" sx={styles.title}>
               Unlock audience
            </Typography>
            <Typography sx={styles.text}>
               Unlock in-depth audience insights
            </Typography>
         </Stack>
         <Box component="ul" sx={styles.metrics}>
            {metrics.map((metric) => (
               <li key={metric}>
                  <span>{metric}</span>
               </li>
            ))}
         </Box>
         <Box sx={styles.text}>
            <GroupPlansDialog />
            <UpgradePlanButton
               text="Unlock it now"
               icon={<Unlock strokeWidth={3} />}
            />
         </Box>
      </Stack>
   )
}
