import { Box, Stack } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import { FC } from "react"
import { useInView } from "react-intersection-observer"
import { sxStyles } from "types/commonTypes"

import { CTASlide } from "./CarouselContentService"
import Content, { ContentHeaderTitle } from "./Content"
import ContentButton from "./ContentButton"

const mobileJobsBackGroundUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/downloadMobileSmall.png?alt=media&token=7e13f3b8-33a3-42c3-a80b-efa9c3d907bf"
const desktopJobsBackGroundUrl =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/downloadMobileLarge.png?alt=media&token=d1a5452b-80d1-4d6a-88fc-777cca94e4dd"

const styles = sxStyles({
   centeredHeaderTitle: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: {
         xs: '32px !important',
         md: '42px !important',
      }
   },
   title: {
      color: 'black',
      fontWeight: 700,
      textWrap: "nowrap",
      maxWidth: {
         xs: '100% !important',
         sm: '60% !important'
      },
      fontSize: {
         xs: '32px !important',
         md: '42px !important',
      }
   },
   subtitle: {
      fontWeight: '600 !important',
      lineHeight: '36px',
      textWrap: "nowrap",
      maxWidth: '65% !important',
      fontSize: '24px !important'
   },
   subtitleMobile: {
      fontWeight: '400 !important',
      maxWidth: '60% !important'
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
         xs: 0,
         md: 0,
      },
   },
   content: {
      justifyContent: { xs: "flex-start !important", sm: "center !important" },
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
         sm: "100%",
      },
      height: "100%",
      "& span": {
         borderRadius: "12px !important",
      },
      "& img": {
         borderRadius: "12px !important",
         right: "-16px !important",
         objectPosition: {
            xs: "top -110% left 0",
            sm: "top 0 left 55%",
            md: "top 0 left 40%",
         },
      },
   },
})

type DownloadMobileApplicationProps = {
   cta: CTASlide
}

export const DownloadMobileApplication: FC<DownloadMobileApplicationProps> = () => {
   const isMobile = useIsMobile("sm")
   const router = useRouter()

   const handleApplicationDownloadLink = () => {
      return router.push({
         pathname: `/install-mobile-application`,
      })
   }


   const { ref } = useInView({
      skip: false,
      triggerOnce: true
   })

   return (
      <Box ref={ref} height={"100%"} width={"100%"}>
         <Content
            headerTitle={
            <>
            {!isMobile && <ContentHeaderTitle
                   component="span"
                   color="black"
                   sx={styles.subtitle}
               >{"No more missed livestreams"}
               </ContentHeaderTitle>}
                  <br/>
               <ContentHeaderTitle
                  component="span"
                  color="black"
                  sx={styles.title}
               >
                  {"The "}
                  <ContentHeaderTitle
                     sx={styles.centeredHeaderTitle}
                     color="primary"
                  >
                     CareerFairy App
                  </ContentHeaderTitle>
                  <br/>
                  <ContentHeaderTitle
                      component="span"
                      color="black"
                      sx={styles.title}
                  >{"is coming soon!"}</ContentHeaderTitle>
               </ContentHeaderTitle>
            </>
            }
            backgroundImageUrl={
               isMobile ? mobileJobsBackGroundUrl : desktopJobsBackGroundUrl
            }
            hideBackground={true}
            infoSx={styles.info}
            contentSx={styles.content}
            actionItem={
               <Stack>
                  {isMobile && <ContentHeaderTitle
                      component="span"
                      color="black"
                      sx={styles.subtitleMobile}
                      fontSize={"16px !important"}
                  >{"No more missed live streams"}
                  </ContentHeaderTitle>}
                  <Box mt={isMobile ? 1.5 : 0}>
                     <ContentButton
                        variant="contained"
                        onClick={handleApplicationDownloadLink}
                        color={"primary"}
                     >
                        Download now
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
               alt={"Mobile download illustration"}
               layout="fill"
               objectFit={"cover"}
               quality={90}
            />
         </Box>
      </Box>
   )
}
