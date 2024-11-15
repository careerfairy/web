import {
   AppBar,
   Avatar,
   Box,
   Container,
   Slide,
   Tabs,
   TabsOwnProps,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import { styled, useTheme } from "@mui/material/styles"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useCallback, useMemo } from "react"
import { useMountedState } from "react-use"
import { TabValue, TabValueType, getTabLabel, useCompanyPage } from "../"
import { companyLogoPlaceholder } from "../../../../constants/images"
import SimpleTab from "../../../../materialUI/GlobalTabs/SimpleTab"
import { sxStyles } from "../../../../types/commonTypes"
import useControlledTabNavigationOnScroll from "../../../custom-hook/useControlledTabNavigationOnScroll"
import useElementIsAtTopOfPage from "../../../custom-hook/useElementIsAtTopOfPage"
import useIsMobile from "../../../custom-hook/useIsMobile"
import Link from "../../common/Link"
import FollowButton from "../../common/company/FollowButton"
import PublicSparksBadge from "../../common/icons/PublicSparksBadge"
import BannerIllustration from "./BannerIllustration"
import ShareButton from "./ShareButton"

const LOGO_SIZE = 112
const STICKY_LOGO_SIZE = 60
const DESKTOP_LOGO_SIZE = LOGO_SIZE * 1.5
const NAV_BG_COLOR = "#EFF5F8"

const styles = sxStyles({
   imageWrapper: {
      width: "100%",
      height: { xs: "250px", md: "300px" },
      position: "relative",
   },
   logo: {
      width: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      height: { xs: LOGO_SIZE, md: DESKTOP_LOGO_SIZE },
      marginRight: "-5px",
      marginLeft: { xs: "10px", md: 3 },
   },
   companyTitle: {
      textShadow: (theme) => ({
         md: theme.legacy.darkTextShadow,
      }),
   },
   companyTitleSticky: {
      display: "none",
   },
   stickyLogo: {
      width: STICKY_LOGO_SIZE,
      height: STICKY_LOGO_SIZE,
      "& > img": {
         maxWidth: "100%",
         maxHeight: "100%",
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
      zIndex: (theme) => theme.zIndex.appBar - 1,
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
         xs: "70px",
         md: "100px",
      },
   },
   companyNameMobileNotSticky: {
      backgroundColor: "white",
   },
   navigatorTabs: {
      display: "flex",
      alignItems: "center",
      flex: 1,
      height: { xs: "50px", md: "60px" },
      backgroundColor: NAV_BG_COLOR,
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
      backgroundColor: NAV_BG_COLOR,
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
   badge: {
      bgcolor: "unset",
      color: "unset",
      ml: 1,

      "& svg": {
         width: 32,
         height: 32,
      },
   },
})

const ToolbarOffset = styled("div")({ minHeight: "49px" })

const Header = () => {
   const isMobile = useIsMobile()
   const featureFlags = useFeatureFlags()
   const isMounted = useMountedState()

   const [ref, elementIsTop] = useElementIsAtTopOfPage({
      offset: isMobile ? -60 : 70,
   })

   const { group, editMode, sectionRefs } = useCompanyPage()
   const theme = useTheme()

   const { logoUrl, universityName, publicSparks } = group

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
         .filter((ref) => {
            return Object.values(TabValue).includes(
               ref.current?.id as TabValueType
            )
         })
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
                  label={getTabLabel(sectionId, featureFlags)}
                  value={sectionId}
                  key={sectionId}
                  component={Link}
                  href={`#${sectionId}`}
                  id={`tab-${sectionId}`}
                  index={index}
               />
            )
         })
   }, [featureFlags, sectionRefsArray, theme.palette.secondary.main, value])

   if (!isMounted()) return null

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
                  minWidth={isSticky ? { md: "300px" } : null}
                  bgcolor={NAV_BG_COLOR}
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
                        bgcolor={isMobile ? "white" : NAV_BG_COLOR}
                     >
                        <CircularLogo
                           sx={styles.logo}
                           alt={`${universityName} logo`}
                           src={logoUrl || companyLogoPlaceholder}
                           size={DESKTOP_LOGO_SIZE}
                        />
                        {isMobile ? (
                           <span>
                              <ActionButtons />
                           </span>
                        ) : null}
                     </Stack>
                  )}
                  <Box sx={styles.navigatorInfoWrapper}>
                     <Box
                        sx={[
                           styles.companyName,
                           styles.companyNameSticky,
                           isMobile &&
                              !isSticky &&
                              styles.companyNameMobileNotSticky,
                        ]}
                     >
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
                        {!isSticky && publicSparks ? (
                           <Avatar sx={styles.badge}>
                              <PublicSparksBadge />
                           </Avatar>
                        ) : null}
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
                              exit={false}
                              direction={"down"}
                              in={isSticky}
                           >
                              <CircularLogo
                                 src={logoUrl || companyLogoPlaceholder}
                                 alt={`${universityName} logo`}
                                 size={STICKY_LOGO_SIZE}
                                 sx={styles.stickyLogo}
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
                                    {
                                       sx: styles.indicator,
                                    } as TabsOwnProps["TabIndicatorProps"]
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
               <Box flex={1} bgcolor={NAV_BG_COLOR} />
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
      <Stack spacing={1} pr={3} direction={"row"}>
         {showFollowButton ? (
            <FollowButton
               sx={{
                  fontSize: undefined,
               }}
               color="primary"
               size="medium"
               group={group}
            />
         ) : null}
         {showShareButton ? <ShareButton /> : null}
      </Stack>
   )
}

export default Header
