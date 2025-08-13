import { Box, Button, Stack, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import Link from "components/views/common/Link"
import { useGroup } from "layouts/GroupDashboardLayout"
import useEmblaCarousel from "embla-carousel-react"
import React, { useMemo } from "react"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"

const styles = sxStyles({
   carouselContainer: {
      px: 2, // 16px margin between tile borders and carousel
   },
   guideCard: {
      height: "322px", // Fixed height as specified
      display: "flex",
      flexDirection: "column",
      border: (theme) => `1px solid ${theme.palette.neutral[100]}`,
      borderRadius: 2,
      overflow: "hidden",
      backgroundColor: "white",
   },
   guideImage: {
      width: "100%",
      height: "140px", // Fixed height as specified
      objectFit: "cover",
      display: "block",
   },
   guideContent: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      p: 2,
   },
   guideTitle: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.4,
      mb: 1,
      textAlign: "left",
   },
   guideText: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
      color: "text.secondary",
      mb: 2,
      flex: 1,
      textAlign: "left",
   },
   ctaButton: {
      border: (theme) => `1px solid ${theme.palette.neutral[200]}`,
      backgroundColor: "transparent",
      color: "neutral.600",
      textTransform: "none",
      fontWeight: 500,
      justifyContent: "flex-start",
      textAlign: "left",
      "&:hover": {
         backgroundColor: "neutral.50",
      },
   },
})

const GUIDE_CARDS_DATA = [
   {
      id: 1,
      title: "Host live streams that attract and engage top talent",
      text: "Learn the three key stages before, during and after the event to plan effectively, present with impact and follow up for measurable recruitment results.",
      cta: "Read the full guide",
      url: "https://support.careerfairy.io/en/article/live-stream-your-way-to-top-talent-a-guide-to-engaging-gen-z-recruitment-1ifie4a/",
      image: "/images/guides/livestream-guide.svg",
   },
   {
      id: 2,
      title: "New Live stream management experience",
      text: "Discover the new Live stream management experience, designed to enhance your workflow with easily accessible metrics, streamlined navigation, and a clearer overview.",
      cta: "Discover now",
      url: "https://careerfairy-ssr-webapp-pr-1737.vercel.app/group/[groupId]/admin/content/live-streams",
      image: "/images/guides/management-guide.svg",
   },
   {
      id: 3,
      title: "Promote your offline events",
      text: "Showcase your career fairs, info sessions, and on-campus events to a targeted audience already engaged with your company. Increase registrations and attendance by leveraging our platform.",
      cta: "Talk to us",
      url: "https://meetings.hubspot.com/denis-lehn-koza/clientdemocallcalender",
      image: "/images/guides/events-guide.svg",
   },
]

const GuideCard = ({ guide }: { guide: typeof GUIDE_CARDS_DATA[0] }) => {
   return (
      <Box sx={styles.guideCard}>
         <img
            src={guide.image}
            alt={guide.title}
            style={styles.guideImage}
            onError={(e) => {
               // Fallback to a placeholder if image fails to load
               e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDMyMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxyZWN0IHg9IjEzNSIgeT0iNTUiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjQiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+"
            }}
         />
         <Box sx={styles.guideContent}>
            <Typography sx={styles.guideTitle}>{guide.title}</Typography>
            <Typography sx={styles.guideText}>{guide.text}</Typography>
            {guide.url ? (
               <Link href={guide.url} underline="none" target="_blank">
                  <Button sx={styles.ctaButton} fullWidth>
                     {guide.cta}
                  </Button>
               </Link>
            ) : (
               <Button sx={styles.ctaButton} fullWidth disabled>
                  {guide.cta}
               </Button>
            )}
         </Box>
      </Box>
   )
}

const GuidesCard = () => {
   const { group } = useGroup()
   const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: false,
      axis: "x",
      align: "start",
      slidesToScroll: 1,
   })

   // Replace [groupId] placeholder with actual group ID in URLs
   const guidesData = useMemo(() => {
      return GUIDE_CARDS_DATA.map((guide) => ({
         ...guide,
         url: guide.url.replace("[groupId]", group.id),
      }))
   }, [group.id])

   return (
      <CardCustom title="Guides">
         <Box sx={styles.carouselContainer}>
            <ContentCarousel
               emblaProps={{
                  emblaRef,
                  emblaApi,
               }}
               slideWidth={280} // Responsive width for cards
            >
               {guidesData.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
               ))}
            </ContentCarousel>
         </Box>
      </CardCustom>
   )
}

export default GuidesCard