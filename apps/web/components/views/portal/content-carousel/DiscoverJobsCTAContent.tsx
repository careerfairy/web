import { SparkInteractionSources } from "@careerfairy/shared-lib/sparks/telemetry"
import { Box, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import { HeavyCheckMarkIcon } from "components/views/common/icons/HeavyCheckMarkIcon"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { FC } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"

import CarouselContentService, {
   CTASlide,
   CTASlideTopics,
} from "./CarouselContentService"
import Content, { ContentHeaderTitle } from "./Content"
import ContentButton from "./ContentButton"

const SPARK_TO_NAVIGATE_TO_ID = "QJhyftocyWRPoIEaH5W7"

const mobileJobsBackGroundUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2FMobileFullJobsBanner_v3.png?alt=media&token=8f9b3d3f-389e-4499-a78f-b72ec08a7505"
const desktopJobsBackGroundUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2FDesktopFullJobsBanner_v2.png?alt=media&token=b59724f7-fe83-4cf3-a74b-8eb1eca23d30"

const styles = sxStyles({
   centeredHeaderTitle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
   },
   title: {
      fontWeight: 700,
      textWrap: "nowrap",
   },
   descriptions: {
      fontWeight: "400 !important",
   },
   easyApply: {
      fontSize: "18px !important",
      fontWeight: "400 !important",
   },
   easyApplyWrapper: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 8px",
      transform: "rotate(-1deg)",
      gap: "10px",
      borderRadius: "8px",
      background: "rgba(120, 214, 255, 0.30)",
   },
   info: {
      mt: {
         xs: 2,
         md: 0,
      },
   },
   content: {
      justifyContent: { xs: "flex-start !important", md: "center !important" },
      height: "100% !important",
   },
   actionItem: {
      maxWidth: {
         xs: "100%",
         md: "70%",
         lg: "90%",
         xl: "100%",
      },
      mt: {
         xs: 0.5,
         md: 1.5,
      },
   },
   illustrationWrapper: {
      position: "absolute",
      right: 0,
      top: 0,
      width: {
         xs: "100%",
         sm: "60%",
      },
      height: "100%",
      "& img": {
         borderRadius: "12px",
         objectPosition: {
            xs: "top 180px left 0px",
            sm: "top 50% left 20%",
         },
      },
   },
})

type DiscoverJobsCTAContentProps = {
   cta: CTASlide
}

export const DiscoverJobsCTAContent: FC<DiscoverJobsCTAContentProps> = () => {
   const isMobile = useIsMobile("sm")
   const { userData, isLoadingAuth, isLoadingUserData } = useAuth()
   const router = useRouter()

   const handleDiscoverNowClick = () => {
      return router.push({
         pathname: `/sparks/${SPARK_TO_NAVIGATE_TO_ID}`,
         query: {
            ...router.query,
            interactionSource: SparkInteractionSources.PortalBanner,
         },
      })
   }

   const isAuthLoading = isLoadingAuth || isLoadingUserData

   const { ref } = useInView({
      skip: isAuthLoading || !userData?.userEmail, // Only start counting when user is logged in
      triggerOnce: true,
      onChange: (inView) => {
         CarouselContentService.incrementCTABannerViewCount(
            inView,
            userData,
            CTASlideTopics.Jobs
         )
      },
   })

   return (
      <Box ref={ref} height={"100%"} width={"100%"}>
         <Content
            headerTitle={
               <ContentHeaderTitle
                  component="span"
                  maxWidth={isMobile ? "100%" : "60% !important"}
                  color="black"
                  sx={styles.title}
                  fontSize={isMobile ? "32px !important" : "42px !important"}
               >
                  {"CareerFairy "}
                  <ContentHeaderTitle
                     sx={styles.centeredHeaderTitle}
                     color="primary"
                     fontSize={isMobile ? "32px !important" : "42px !important"}
                  >
                     Jobs
                  </ContentHeaderTitle>
                  !
               </ContentHeaderTitle>
            }
            backgroundImageUrl={
               isMobile ? mobileJobsBackGroundUrl : desktopJobsBackGroundUrl
            }
            hideBackground={true}
            infoSx={styles.info}
            contentSx={styles.content}
            actionItem={
               <Stack>
                  <Stack spacing={isMobile ? 1 : 1.5}>
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={0.5}
                     >
                        <HeavyCheckMarkIcon />
                        <Typography
                           variant="brandedH3"
                           color={"neutral.800"}
                           sx={styles.descriptions}
                           fontSize={isMobile ? "18px" : "20px"}
                        >
                           Escape the{" "}
                           {
                              <Box sx={styles.easyApplyWrapper}>
                                 <Typography
                                    variant="brandedH3"
                                    sx={styles.easyApply}
                                 >
                                    easy apply
                                 </Typography>
                              </Box>
                           }{" "}
                           trap
                        </Typography>
                     </Stack>
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={0.5}
                     >
                        <HeavyCheckMarkIcon />
                        <Typography
                           variant="brandedH3"
                           color={"neutral.800"}
                           sx={styles.descriptions}
                           fontSize={isMobile ? "18px" : "20px"}
                        >
                           Discover your ideal job with rich content
                        </Typography>
                     </Stack>
                  </Stack>
                  <Box mt={isMobile ? 1.5 : 3}>
                     <ContentButton
                        variant="contained"
                        onClick={handleDiscoverNowClick}
                        color={"primary"}
                     >
                        Discover now
                     </ContentButton>
                  </Box>
               </Stack>
            }
            actionItemSx={styles.actionItem}
            withBackgroundOverlay={false}
         />
         <Box sx={styles.illustrationWrapper}>
            <Image
               src={
                  isMobile ? mobileJobsBackGroundUrl : desktopJobsBackGroundUrl
               }
               alt={"Jobs illustration"}
               layout="fill"
               objectFit={isMobile ? "none" : "cover"}
               quality={90}
            />
         </Box>
      </Box>
   )
}
