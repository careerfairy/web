import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useIsMobile from "components/custom-hook/useIsMobile"
import CareerCoinIcon from "components/views/common/CareerCoinIcon"
import Image from "next/image"
import { FC, Fragment } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"
import CarouselContentService, { CTASlide } from "./CarouselContentService"
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
      top: 0,
      width: {
         xs: "40%",
         md: "50%",
      },
      height: "100%",
      "& img": {
         objectPosition: {
            xs: "top 28px left 18px",
            md: "top 50% left 90px",
         },
      },
   },
})

type Props = {
   cta: CTASlide
}

const BuyCreditsCTAContent: FC<Props> = () => {
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
            "CareerCoins"
         ),
   })

   return (
      <Fragment>
         <Content
            ref={ref}
            headerTitle={
               <ContentHeaderTitle maxWidth={"60% !important"} color="black">
                  Introducing{" "}
                  <ContentHeaderTitle
                     sx={styles.centeredHeaderTitle}
                     color="primary.main"
                  >
                     CareerCoins{" "}
                     <Box component="span" minWidth={25.38} mb={-0.5}>
                        <CareerCoinIcon width={25.38} height={33.7} />
                     </Box>
                     !
                  </ContentHeaderTitle>
               </ContentHeaderTitle>
            }
            title={
               <ContentTitle
                  maxWidth={isMobile ? "60% !important" : "80% !important"}
                  color="black"
               >
                  Now you can easily re-watch past live streams that are
                  available using your CareerCoins!
               </ContentTitle>
            }
            backgroundImageUrl={
               isMobile
                  ? mobileCreditsCTABackground
                  : desktopCreditsCTABackground
            }
            backgroundImageAlt="backgroundImageAlt"
            actionItem={
               <ContentButton href={"/past-livestreams"} color={"primary"}>
                  Discover Recordings
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
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fdesktop-background.png?alt=media&token=20e4a946-a4df-409d-a259-fc07cccd39a7"
const mobileCreditsCTABackground =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fmobile-background.png?alt=media&token=5bd44d36-30b3-4777-af25-4b4fe25f09c3"
const desktopCreditsCTAIllustration =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fdesktop-interface.png?alt=media&token=f56a4eae-8650-421d-9061-6724450c2d11"
const mobileCreditsCTAIllustration =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/misc%2Fmobile-interface.png?alt=media&token=6ee60799-9c0e-4ad3-ad13-0b07395e38b3"

export default BuyCreditsCTAContent
