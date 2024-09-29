import { Box, Stack } from "@mui/material"
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
})

type DiscoverJobsCTAContentProps = {
   cta: CTASlide
}

export const DiscoverJobsCTAContent = ({
   cta,
}: DiscoverJobsCTAContentProps) => {
   console.log("🚀 ~ DiscoverJobsCTAContent ~ cta:", cta)
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
                  maxWidth={"60% !important"}
                  color="black"
               >
                  {"CareerFairy "}
                  <ContentHeaderTitle
                     sx={styles.centeredHeaderTitle}
                     color="secondary.main"
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
                  <ContentButton
                     variant="contained"
                     href={"/sparks"}
                     color={"secondary"}
                  >
                     Discover now
                  </ContentButton>
               </Stack>
            }
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
