import { ReactNode } from "react"
import { Box, Stack, SxProps, Theme } from "@mui/material"
import { sxStyles } from "types/commonTypes"

import ConditionalWrapper from "components/util/ConditionalWrapper"
import UpgradePlanButton from "./UpgradePlanButton"
import { Star } from "react-feather"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   contentWrapper: {
      backgroundImage: "url('/star.svg')",
      backgroundPosition: "right 0px",
      backgroundRepeat: "no-repeat",
   },
   banner: {
      my: 1,
      display: "flex",
      p: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "215px",
      backgroundColor: "red",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: (theme) => theme.brand.warning[600],
      background:
         "linear-gradient(94deg, rgba(255, 0, 0, 0.10) 1.13%, rgba(255, 0, 0, 0.00) 58.83%), rgba(255, 22, 22, 0.60)",
      backgroundImage: "url('/star-full.png')",
      backgroundRepeat: "no-repeat",
      backgroundPositionX: "right",
      backgroundSize: "100%",
   },
   buttonWrapper: {
      minWidth: "250px",
      pb: 2,
      alignContent: "center",
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      backgroundRepeat: "no-repeat",
   },
   upgradeButton: {
      color: "white",
      backgroundColor: (theme) => theme.palette.secondary.main,
      mt: 1,
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
   },
})

type Props = {
   title: ReactNode
   description: string | ReactNode
   bannerSx?: SxProps<Theme>
   show?: boolean
}

const UpgradePlanBanner = ({ title, description, bannerSx, show }: Props) => {
   const isMobile = useIsMobile("md")

   return (
      <ConditionalWrapper condition={show}>
         <Stack
            sx={bannerSx || styles.banner}
            direction={isMobile ? "column" : "row"}
         >
            <Stack alignItems={"start"}>
               <Box>{title}</Box>
               <Box>{description}</Box>
            </Stack>
            <Box sx={styles.buttonWrapper}>
               <UpgradePlanButton
                  text="Upgrade now"
                  icon={<Star strokeWidth={3} />}
               />
            </Box>
         </Stack>
      </ConditionalWrapper>
   )
}

export default UpgradePlanBanner
