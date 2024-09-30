import { Box, Stack, SvgIcon, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/legacy/image"
import { Fragment } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import CarouselContentService, {
   CTASlide,
   CTASlideTopics,
} from "./CarouselContentService"
import Content, { ContentHeaderTitle } from "./Content"
import ContentButton from "./ContentButton"

const mobileJobsBackGroundUrl =
   "https://storage.cloud.google.com/careerfairy-e1fd9.appspot.com/misc/jobs-background-mobile-24b06f289b4557de7eeeb5182a6496f7.png"
const desktopJobsBackGroundUrl =
   "https://storage.cloud.google.com/careerfairy-e1fd9.appspot.com/misc/jobs-background-desktop-5208ad3aaf80c0f7c70f3151adab3405.png"

const styles = sxStyles({
   centeredHeaderTitle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
   },
   illustrationWrapper: {
      position: "absolute",
      right: 0,
      bottom: 0,
      width: {
         xs: "50%",
         md: "40%",
      },
      height: "100%",
      "& img": {
         objectPosition: {
            xs: "top 28px left 18px",
            md: "top 0px left 0px",
         },
      },
   },
   title: {
      fontWeight: 700,
   },
   descriptions: {
      fontSize: "20px !important",
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
})

type DiscoverJobsCTAContentProps = {
   cta: CTASlide
}

export const DiscoverJobsCTAContent = ({
   cta,
}: DiscoverJobsCTAContentProps) => {
   console.log("🚀 ~ cta:", cta)
   const isMobile = useIsMobile()
   const { userData, isLoadingAuth, isLoadingUserData } = useAuth()

   const isAuthLoading = isLoadingAuth || isLoadingUserData

   const { ref } = useInView({
      skip: isAuthLoading || !userData?.userEmail, // Only start counting when user is logged in
      triggerOnce: true,
      onChange: (inView) =>
         CarouselContentService.incrementCTABannerViewCount(
            inView,
            userData,
            CTASlideTopics.Jobs
         ),
   })

   return (
      <Fragment>
         <Content
            ref={ref}
            headerTitle={
               <ContentHeaderTitle
                  component="span"
                  maxWidth={"80% !important"}
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
            backgroundImageAlt="backgroundImageAlt"
            actionItem={
               <Stack>
                  <Stack spacing={1.5}>
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={0.5}
                     >
                        <SvgIcon>
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                           >
                              <g clip-path="url(#clip0_14168_173034)">
                                 <path
                                    d="M17.5 0.626465L5.875 13.4077L2.5 10.8452H0.625L5.875 19.3765L19.375 0.626465H17.5Z"
                                    fill="black"
                                    fill-opacity="0.19"
                                 />
                              </g>
                              <defs>
                                 <clipPath id="clip0_14168_173034">
                                    <rect
                                       width="20"
                                       height="20"
                                       fill="white"
                                       transform="translate(0 0.00146484)"
                                    />
                                 </clipPath>
                              </defs>
                           </svg>
                        </SvgIcon>
                        <Typography
                           variant="brandedH3"
                           color={"neutral.800"}
                           sx={styles.descriptions}
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
                        <SvgIcon>
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                           >
                              <g clip-path="url(#clip0_14168_173034)">
                                 <path
                                    d="M17.5 0.626465L5.875 13.4077L2.5 10.8452H0.625L5.875 19.3765L19.375 0.626465H17.5Z"
                                    fill="black"
                                    fill-opacity="0.19"
                                 />
                              </g>
                              <defs>
                                 <clipPath id="clip0_14168_173034">
                                    <rect
                                       width="20"
                                       height="20"
                                       fill="white"
                                       transform="translate(0 0.00146484)"
                                    />
                                 </clipPath>
                              </defs>
                           </svg>
                        </SvgIcon>
                        <Typography
                           variant="brandedH3"
                           color={"neutral.800"}
                           sx={styles.descriptions}
                        >
                           Discover your ideal job with rich content.
                        </Typography>
                     </Stack>
                  </Stack>
                  <Box mt={3}>
                     <ContentButton
                        variant="contained"
                        href={
                           "/sparks/QJhyftocyWRPoIEaH5W7?interaction_source=portal-banner"
                        }
                        color={"primary"}
                     >
                        Discover now
                     </ContentButton>
                  </Box>
               </Stack>
            }
            actionItemSx={{ mt: 1.5 }}
            withBackgroundOverlay={false}
         />
         <Box sx={styles.illustrationWrapper}>
            <Image
               src={
                  isMobile ? mobileJobsBackGroundUrl : desktopJobsBackGroundUrl
               }
               alt={"illustration"}
               layout="fill"
               objectFit="cover"
               quality={90}
            />
         </Box>
      </Fragment>
   )
}
