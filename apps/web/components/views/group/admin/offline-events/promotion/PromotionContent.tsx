import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { sxStyles } from "types/commonTypes"

const PROMOTION_CONTENT_CARDS = [
   {
      headerImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FImage%201.png?alt=media&token=be2ce073-1680-41dc-9504-711fda38e6a2",
      title: "Reach students where they are",
      subtitle:
         "Gen Z expects everything, everywhere all at once: create attraction journeys which are both online (live streams) and offline (recruiting events)",
      background: "#FBEDFD",
   },
   {
      headerImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FImage%202.png?alt=media&token=4c00752e-fd25-450e-a311-14429a99f8ff",
      title: "Target with precision",
      subtitle:
         "Promote events by field of study, university. Ensure you reach the profiles that matter among a career-focussed audience",
      background: "#FBF8E6",
   },
   {
      headerImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FImage%203.png?alt=media&token=587ec690-a323-4a1a-9182-5c8f8206e9fd",
      title: "Simplify your outreach",
      subtitle:
         "Manage all your recruiting activities in one place. Keep your student engagement consistent.",
      background: "#FBE6E6",
   },
   {
      headerImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FImage%204.png?alt=media&token=19de5259-ef8b-4bec-9a3b-ec61934f6ce8",
      title: "Track what matters",
      subtitle:
         "Move beyond guesswork. See how many students viewed your event and clicked to register",
      background: "#E6F6FB",
   },
]

const styles = sxStyles({
   promotionContent: {
      width: {
         xs: "100%",
         sm: "100%",
         md: "942px",
      },
      maxWidth: (theme) => (theme.breakpoints.down("md") ? "100%" : "942px"),
      alignItems: "center",
      gap: {
         md: "16px",
         sm: "12px",
         xs: "12px",
      },
      background: (theme) => theme.brand.white[300],
      borderRadius: "12px",
      p: {
         md: "24px",
         sm: "8px",
         xs: "8px",
      },
      overflowX: "hidden",
   },
   promotionContentCard: {
      p: "12px",
      borderRadius: "8px",
      width: "100%",
      maxWidth: {
         md: "439px",
         sm: "100%",
         xs: "100%",
      },
      minHeight: {
         md: "330px",
         lg: "auto",
      },
      background: (theme) => theme.brand.white[100],
      flexShrink: 0,
   },
   slide: {
      flex: "0 0 95%",
   },
})

export const PromotionContent = () => {
   const isMobile = useIsMobile()
   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
         dragFree: false,
         skipSnaps: true,
      },
      [WheelGesturesPlugin()]
   )

   return (
      <Stack sx={styles.promotionContent}>
         <Typography
            variant="brandedH4"
            fontWeight={700}
            color={"neutral.800"}
            textAlign="center"
         >
            Why promote offline events here?
         </Typography>
         {!isMobile ? (
            <Stack direction={"row"} spacing={"16px"} maxWidth={"100%"}>
               <Stack spacing={"16px"}>
                  <PromotionContentCard
                     headerImageUrl={PROMOTION_CONTENT_CARDS[0].headerImageUrl}
                     title={PROMOTION_CONTENT_CARDS[0].title}
                     subtitle={PROMOTION_CONTENT_CARDS[0].subtitle}
                     background={PROMOTION_CONTENT_CARDS[0].background}
                  />
                  <PromotionContentCard
                     headerImageUrl={PROMOTION_CONTENT_CARDS[2].headerImageUrl}
                     title={PROMOTION_CONTENT_CARDS[2].title}
                     subtitle={PROMOTION_CONTENT_CARDS[2].subtitle}
                     background={PROMOTION_CONTENT_CARDS[2].background}
                  />
               </Stack>
               <Stack spacing={"16px"}>
                  <PromotionContentCard
                     headerImageUrl={PROMOTION_CONTENT_CARDS[1].headerImageUrl}
                     title={PROMOTION_CONTENT_CARDS[1].title}
                     subtitle={PROMOTION_CONTENT_CARDS[1].subtitle}
                     background={PROMOTION_CONTENT_CARDS[1].background}
                  />
                  <PromotionContentCard
                     headerImageUrl={PROMOTION_CONTENT_CARDS[3].headerImageUrl}
                     title={PROMOTION_CONTENT_CARDS[3].title}
                     subtitle={PROMOTION_CONTENT_CARDS[3].subtitle}
                     background={PROMOTION_CONTENT_CARDS[3].background}
                  />
               </Stack>
            </Stack>
         ) : (
            <GenericCarousel
               emblaRef={emblaRef}
               emblaApi={emblaApi}
               gap="8px"
               preventEdgeTouch
               sx={{
                  overflow: "visible",
               }}
            >
               {PROMOTION_CONTENT_CARDS.map((card, idx) => {
                  return (
                     <GenericCarousel.Slide key={idx} sx={styles.slide}>
                        <PromotionContentCard
                           headerImageUrl={card.headerImageUrl}
                           title={card.title}
                           subtitle={card.subtitle}
                           background={card.background}
                        />
                     </GenericCarousel.Slide>
                  )
               })}
            </GenericCarousel>
         )}
      </Stack>
   )
}

type PromotionContentCardProps = {
   headerImageUrl: string
   title: string
   subtitle: string
   background: string
}

const PromotionContentCard = ({
   headerImageUrl,
   title,
   subtitle,
   background,
}: PromotionContentCardProps) => {
   return (
      <Stack spacing={"12px"} sx={styles.promotionContentCard}>
         <Box
            sx={{
               width: "100%",
               height: "158px",
               paddingBottom: "42.86%", // 21:9 aspect ratio (9/21 = 0.4286)
               borderRadius: "4px",
               backgroundImage: `url(${headerImageUrl})`,
               backgroundColor: background,
               backgroundSize: "cover",
               backgroundPosition: "center",
               position: "relative",
               overflow: "hidden",
            }}
         />
         <Stack spacing={"4px"}>
            <Typography
               variant="medium"
               fontWeight={600}
               color={"neutral.800"}
               textAlign={"center"}
            >
               {title}
            </Typography>
            <Typography
               variant="medium"
               color={"neutral.700"}
               textAlign={"center"}
            >
               {subtitle}
            </Typography>
         </Stack>
      </Stack>
   )
}
