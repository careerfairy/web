import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/image"
import { FC, Fragment } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import CarouselContentService, {
   CTASlide,
   CTASlideTopics,
} from "./CarouselContentService"
import Content, { ContentHeaderTitle, ContentTitle } from "./Content"
import ContentButton from "./ContentButton"

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

type Props = {
   cta: CTASlide
}

const WatchSparksCTAContent: FC<Props> = () => {
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
            CTASlideTopics.Sparks
         ),
   })

   return (
      <Fragment>
         <Content
            ref={ref}
            headerTitle={
               <ContentHeaderTitle maxWidth={"60% !important"} color="black">
                  {"Discover "}
                  <ContentHeaderTitle
                     sx={styles.centeredHeaderTitle}
                     color="secondary.main"
                  >
                     Sparks
                  </ContentHeaderTitle>
                  !
               </ContentHeaderTitle>
            }
            title={
               <ContentTitle
                  maxWidth={isMobile ? "50%!important" : "70%!important"}
                  color="black"
               >
                  Short videos answering your questions and showing great
                  opportunities for you.
               </ContentTitle>
            }
            backgroundImageUrl={
               isMobile
                  ? mobileCreditsCTABackground
                  : desktopCreditsCTABackground
            }
            backgroundImageAlt="backgroundImageAlt"
            actionItem={
               <ContentButton
                  variant="contained"
                  href={"/sparks"}
                  color={"secondary"}
               >
                  {isMobile ? "Discover Sparks " : "Watch Sparks"}
               </ContentButton>
            }
            withBackgroundOverlay={false}
         />
         <Box sx={styles.illustrationWrapper}>
            <Image
               src={
                  isMobile
                     ? mobileCreditsCTAIllustration
                     : desktopCreditsCTAIllustration
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

const desktopCreditsCTABackground =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-background-desktop.png?alt=media&token=28d768f0-4c24-44fb-82ba-db42ff19017e"
const mobileCreditsCTABackground =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-background-mobile.png?alt=media&token=6ef9779e-7539-4d6f-98a5-fdc864ca81db"
const desktopCreditsCTAIllustration =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-mockup-desktop.png?alt=media&token=4298c1bb-e4ee-4f0c-9dfb-6faacec3310a"
const mobileCreditsCTAIllustration =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fsparks-mockup-mobile.png?alt=media&token=dd30fa3b-5d8a-4350-b158-919ef911fd3a"

export default WatchSparksCTAContent
