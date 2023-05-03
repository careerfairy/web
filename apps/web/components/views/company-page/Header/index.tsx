import { getTabLabel, TabValue, TabValueType, useCompanyPage } from "../"
import {
   AppBar,
   Avatar,
   Box,
   Container,
   Slide,
   Tabs,
   Typography,
} from "@mui/material"
import { getResizedUrl } from "../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../types/commonTypes"
import { companyLogoPlaceholder } from "../../../../constants/images"
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab"
import React, { useCallback, useMemo } from "react"
import { styled, useTheme } from "@mui/material/styles"
import Stack from "@mui/material/Stack"
import FollowButton from "../../common/company/FollowButton"
import ShareButton from "./ShareButton"
import useElementIsAtTopOfPage from "../../../custom-hook/useElementIsAtTopOfPage"
import useIsMobile from "../../../custom-hook/useIsMobile"
import useControlledTabNavigationOnScroll from "../../../custom-hook/useControlledTabNavigationOnScroll"
import Link from "../../common/Link"
import BannerIllustration from "./BannerIllustration"

const LOGO_SIZE = 112
const STICKY_LOGO_SIZE = 60
const DESKTOP_LOGO_SIZE = LOGO_SIZE * 1.5

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "250px", md: "300px" },
      position: "relative",
   },
   logo: {
      width: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      height: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      borderRadius: 2,
      marginRight: "-5px",
      background: (theme) => theme.palette.common.white,
      boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.08)",
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
      marginLeft: { xs: "10px", md: 3 },
   },
   companyTitle: {
      textShadow: (theme) => ({
         md: theme.darkTextShadow,
      }),
   },
   companyTitleSticky: {
      display: "none",
   },
   stickyLogo: {
      width: STICKY_LOGO_SIZE,
      height: STICKY_LOGO_SIZE,
      backgroundColor: "white",
      boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.08)",
      borderRadius: 2,
      "& img": {
         objectFit: "contain",
         height: "85%",
         width: "85%",
      },
   },
   navigatorWrapper: {
      marginTop: { xs: "-60px", md: "-100px" },
      display: "flex",
      width: "-webkit-fill-available",
      flexDirection: { xs: "column", md: "row" },
   },
   headerWrapperSticky: {
      position: "fixed",
      top: 5,
      left: 0,
      zIndex: (theme) => theme.zIndex.appBar,
      width: "100%",
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
   companyNameSticky: {
      height: {
         xs: "60px",
         md: "100px",
      },
   },
   navigatorTabs: {
      display: "flex",
      alignItems: "center",
      flex: 1,
      height: { xs: "50px", md: "60px" },
      backgroundColor: "#EFF5F8",
   },
   indicator: {
      height: (theme) => theme.spacing(0.4),
      borderRadius: (theme) => theme.spacing(1, 1, 0.3, 0.3),
      backgroundColor: (theme) => theme.palette.secondary.main,
   },
   tabWrapper: {
      height: "100%",
      alignItems: { xs: "unset", md: "end" },
      ml: { md: 1 },
      "& .MuiTabs-scroller": {
         height: "100%",
      },
      "& .MuiTabs-flexContainer": {
         height: "100%",
      },
      "& .MuiTabs-scrollButtons": {
         width: "auto !important",
      },
   },
   tab: {
      fontWeight: (theme) => theme.typography.fontWeightBold,
      fontSize: { xs: "14px", md: "16px" },
      textTransform: "none",
      minWidth: "auto",
      height: "auto",
      opacity: "1",
      color: (theme) => theme.palette.common.black,
      position: "relative",
   },
   appBar: {
      height: "100%",
      width: {
         xs: "100%",
         md: "auto",
      },
      mr: "auto",
   },
   appBarSticky: {
      width: `calc(100% - ${STICKY_LOGO_SIZE}px) !important`,
      height: "auto",
   },
   avatarAndTabsWrapper: {
      backgroundColor: "#EFF5F8",
      display: "flex",
      width: "100%",
      height: "100%",
   },
   avatarAndTabsWrapperSticky: {
      height: "auto",
   },
   headerWrapper: {
      border: "2px solid red",
   },
})

const ToolbarOffset = styled("div")(({ theme }) => theme.mixins.toolbar)

const Header = () => {
   const isMobile = useIsMobile()

   const [ref, elementIsTop] = useElementIsAtTopOfPage({
      offset: isMobile ? -60 : 70,
   })

   const { group, editMode, sectionRefs } = useCompanyPage()
   const theme = useTheme()

   const { logoUrl, universityName } = group

   const isSticky =
      elementIsTop &&
      // Disabling sticky header in edit mode on desktop on the edit page, because it's not working properly
      (!editMode || isMobile)

   const headerHeight = isMobile ? 170 : 52

   const sectionRefsArray = useMemo(
      () => Object.values(sectionRefs).filter((ref) => ref.current?.id),
      [sectionRefs]
   )

   const [value, handleChange] = useControlledTabNavigationOnScroll(
      sectionRefsArray,
      {
         threshold: 0.5,
         initialValue: TabValue.profile,
      }
   )

   const renderTabs = useCallback(() => {
      return sectionRefsArray
         .filter((ref) =>
            Object.values(TabValue).includes(ref.current?.id as TabValueType)
         )
         .map((ref, index) => {
            const sectionId = ref.current.id as TabValueType

            return (
               <SimpleTab
                  sx={[
                     styles.tab,
                     {
                        color:
                           value === TabValue[sectionId] &&
                           theme.palette.secondary.main,
                     },
                  ]}
                  label={getTabLabel(sectionId)}
                  value={sectionId}
                  key={sectionId}
                  component={Link}
                  href={`#${sectionId}`}
                  id={`tab-${sectionId}`}
                  index={index}
               />
            )
         })
   }, [sectionRefsArray, theme.palette.secondary.main, value])

   return (
      <>
         <BannerIllustration />
         <span ref={ref} />
         <Box height={isSticky ? headerHeight : 0} />
         <Box
            sx={[
               styles.headerWrapper && isSticky && styles.headerWrapperSticky,
            ]}
         >
            {isSticky ? <ToolbarOffset /> : null}

            <Box display={"flex"}>
               <Box
                  minWidth={isSticky ? { xs: "unset", md: "300px" } : null}
                  bgcolor={isSticky ? "#EFF5F8" : "transparent"}
                  flex={1}
               />
               <Container
                  disableGutters
                  maxWidth="lg"
                  sx={[styles.navigatorWrapper]}
               >
                  {isSticky ? null : (
                     <Stack
                        alignItems={"flex-end"}
                        direction={"row"}
                        spacing={2}
                     >
                        <Avatar
                           variant="square"
                           sx={styles.logo}
                           alt={`${universityName} logo`}
                           src={
                              getResizedUrl(logoUrl, "sm") ||
                              companyLogoPlaceholder
                           }
                        />
                        {isMobile ? (
                           <span>
                              <ActionButtons />
                           </span>
                        ) : null}
                     </Stack>
                  )}
                  <Box sx={styles.navigatorInfoWrapper}>
                     <Box sx={[styles.companyName, styles.companyNameSticky]}>
                        <Typography
                           sx={[
                              styles.companyTitle,
                              isSticky && styles.companyTitleSticky,
                           ]}
                           variant={universityName.length > 20 ? "h4" : "h3"}
                           fontWeight={"600"}
                           color={{ xs: "black", md: "white" }}
                           ml={{ xs: "20px", md: "30px" }}
                           zIndex={1}
                        >
                           {universityName}
                        </Typography>
                     </Box>
                     <Box sx={styles.navigatorTabs}>
                        <Box
                           sx={[
                              styles.avatarAndTabsWrapper,
                              isSticky && styles.avatarAndTabsWrapperSticky,
                           ]}
                        >
                           <Slide
                              unmountOnExit
                              direction={"down"}
                              in={isSticky}
                           >
                              <Avatar
                                 variant="square"
                                 sx={styles.stickyLogo}
                                 alt={`${universityName} logo`}
                                 src={
                                    getResizedUrl(logoUrl, "sm") ||
                                    companyLogoPlaceholder
                                 }
                              />
                           </Slide>
                           <AppBar
                              sx={[
                                 styles.appBar,
                                 isSticky && styles.appBarSticky,
                              ]}
                              position="static"
                              elevation={0}
                              color="transparent"
                           >
                              <Tabs
                                 value={value}
                                 variant={"scrollable"}
                                 onChange={handleChange}
                                 selectionFollowsFocus
                                 allowScrollButtonsMobile
                                 textColor="inherit"
                                 TabIndicatorProps={
                                    { sx: styles.indicator } as any
                                 }
                                 sx={styles.tabWrapper}
                              >
                                 {renderTabs()}
                              </Tabs>
                           </AppBar>
                        </Box>
                        {isMobile ? null : <ActionButtons />}
                     </Box>
                  </Box>
               </Container>
               <Box flex={1} bgcolor="#EFF5F8" />
            </Box>
         </Box>
      </>
   )
}

const ActionButtons = () => {
   const { group, editMode, groupPresenter } = useCompanyPage()

   const showFollowButton = Boolean(!editMode)

   const showShareButton = groupPresenter.companyPageIsReady()

   return (
      <Stack spacing={1} direction={"row"}>
         {showFollowButton ? (
            <FollowButton color="primary" group={group} />
         ) : null}
         {showShareButton ? <ShareButton /> : null}
      </Stack>
   )
}

export default Header
