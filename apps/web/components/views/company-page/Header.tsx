import { TabValue, useCompanyPage } from "./index"
import { AppBar, Avatar, Box, Tabs, Typography } from "@mui/material"
import { getResizedUrl } from "../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../types/commonTypes"
import {
   companyLogoPlaceholder,
   placeholderBanner,
} from "../../../constants/images"
import BackgroundImage from "components/views/common/BackgroundImage"
import SimpleTab from "../../../materialUI/GlobalTabs/SimpleTab"
import React, { useCallback } from "react"
import { useTheme } from "@mui/material/styles"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "250px", md: "300px" },
      position: "relative",
   },
   logo: {
      width: { xs: 112, md: 160 },
      height: { xs: 112, md: 160 },
      borderRadius: "12px",
      marginRight: "-5px",
      background: (theme) => theme.palette.common.white,
      boxShadow: (theme) => theme.shadows[2],
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
      marginLeft: { xs: "20px", md: "80px" },
   },
   navigatorWrapper: {
      marginTop: { xs: "-80px", md: "-100px" },
      display: "flex",
      width: "-webkit-fill-available",
      flexDirection: { xs: "column", md: "row" },
   },
   navigatorInfoWrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
   companyName: {
      display: "flex",
      alignItems: "center",
      height: { xs: "80px", md: "100px" },
   },
   navigatorTabs: {
      display: "flex",
      alignItems: "center",
      backgroundColor: "#EFF5F8",
      width: "100%",
      height: { xs: "50px", md: "60px" },
      overflowX: "scroll",
   },
   indicator: {
      height: (theme) => theme.spacing(0.4),
      borderRadius: (theme) => theme.spacing(1, 1, 0.3, 0.3),
      backgroundColor: (theme) => theme.palette.secondary.main,
   },
   tabWrapper: {
      height: "100%",
      alignItems: { xs: "unset", md: "end" },
      ml: { xs: "none", md: "50px" },
   },
   tab: {
      fontWeight: (theme) => theme.typography.fontWeightBold,
      fontSize: { xs: "14px", md: "16px" },
      marginRight: { xs: "none", md: "40px" },
      textTransform: "none",
      minWidth: "auto",
      height: "100%",
      opacity: "1",
      color: (theme) => theme.palette.common.black,
   },
})

const Header = () => {
   const { group, tabValue, changeTabValue } = useCompanyPage()
   const theme = useTheme()
   const { bannerImageUrl, logoUrl, universityName } = group

   const handleChangeTab = useCallback(
      (event, value) => {
         changeTabValue(value)
      },
      [changeTabValue]
   )

   return (
      <>
         <Box sx={styles.imageWrapper}>
            <BackgroundImage
               image={getResizedUrl(bannerImageUrl, "lg") || placeholderBanner}
               opacity={0.8}
               repeat={false}
               className={undefined}
               backgroundImageSx={undefined}
            />
         </Box>
         <Box sx={styles.navigatorWrapper}>
            <Avatar
               variant="square"
               sx={styles.logo}
               alt={`${universityName} logo`}
               src={getResizedUrl(logoUrl, "sm") || companyLogoPlaceholder}
            />
            <Box sx={styles.navigatorInfoWrapper}>
               <Box sx={styles.companyName}>
                  <Typography
                     variant={"h3"}
                     fontWeight={"600"}
                     color={{ xs: "black", md: "white" }}
                     ml={"28px"}
                     zIndex={1}
                  >
                     {universityName}
                  </Typography>
               </Box>
               <Box sx={styles.navigatorTabs}>
                  <AppBar
                     position="static"
                     color="transparent"
                     sx={{ height: "100%" }}
                  >
                     <Tabs
                        value={tabValue}
                        variant={"scrollable"}
                        onChange={handleChangeTab}
                        selectionFollowsFocus
                        allowScrollButtonsMobile
                        textColor="inherit"
                        TabIndicatorProps={{ sx: styles.indicator } as any}
                        sx={styles.tabWrapper}
                     >
                        <SimpleTab
                           sx={[
                              styles.tab,
                              {
                                 color:
                                    tabValue === TabValue.profile &&
                                    theme.palette.secondary.main,
                              },
                           ]}
                           label="Profile"
                           value={TabValue.profile}
                           index={0}
                        />
                        <SimpleTab
                           sx={[
                              styles.tab,
                              {
                                 color:
                                    tabValue === TabValue.media &&
                                    theme.palette.secondary.main,
                              },
                           ]}
                           label="Media"
                           value={TabValue.media}
                           index={1}
                        />
                        <SimpleTab
                           sx={[
                              styles.tab,
                              {
                                 minWidth: { xs: "100px", md: "150px" },
                                 color:
                                    tabValue === TabValue.testimonials &&
                                    theme.palette.secondary.main,
                              },
                           ]}
                           label="Testimonials"
                           value={TabValue.testimonials}
                           index={2}
                        />
                        <SimpleTab
                           sx={[
                              styles.tab,
                              {
                                 minWidth: { xs: "100px", md: "150px" },
                                 color:
                                    tabValue === TabValue.livesStreams &&
                                    theme.palette.secondary.main,
                              },
                           ]}
                           label="Live streams"
                           value={TabValue.livesStreams}
                           index={3}
                        />
                     </Tabs>
                  </AppBar>
               </Box>
            </Box>
         </Box>
      </>
   )
}

export default Header
