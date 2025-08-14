import { Box, Button, Stack, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"

const styles = sxStyles({
   carouselContainer: {
      position: "relative",
      height: "422px",
      padding: "16px",
   },
   carousel: {
      position: "relative",
      height: "100%",
      overflow: "hidden",
   },
   cardContainer: {
      display: "flex",
      transition: "transform 0.3s ease-in-out",
      height: "100%",
   },
   card: {
      minWidth: "100%",
      height: "322px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: 0,
   },
   cardImage: {
      width: "100%",
      height: "140px",
      objectFit: "cover",
      borderRadius: "8px",
   },
   cardTitle: {
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: "24px",
      marginTop: "16px",
      marginBottom: "8px",
   },
   cardText: {
      fontSize: "14px",
      lineHeight: "20px",
      color: "text.secondary",
      marginBottom: "16px",
      flex: 1,
   },
   ctaButton: {
      width: "163px",
      height: "40px",
      border: "1px solid",
      borderColor: "neutral.200",
      backgroundColor: "transparent",
      color: "neutral.600",
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 500,
      "&:hover": {
         backgroundColor: "neutral.50",
      },
   },
   navigationButton: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 2,
      minWidth: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "background.paper",
      border: "1px solid",
      borderColor: "neutral.200",
      color: "neutral.600",
      "&:hover": {
         backgroundColor: "neutral.50",
      },
      "&:disabled": {
         opacity: 0.3,
      },
   },
   prevButton: {
      left: "8px",
   },
   nextButton: {
      right: "8px",
   },
   indicators: {
      position: "absolute",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: "8px",
   },
   indicator: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "neutral.200",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&.active": {
         backgroundColor: "primary.main",
      },
   },
})

type GuideCard = {
   id: number
   title: string
   text: string
   cta: string
   url: string
   image: string
}

const guideCards: GuideCard[] = [
   {
      id: 1,
      title: "Host live streams that attract and engage top talent",
      text: "Learn the three key stages before, during and after the event to plan effectively, present with impact and follow up for measurable recruitment results.",
      cta: "Read the full guide",
      url: "https://support.careerfairy.io/en/article/live-stream-your-way-to-top-talent-a-guide-to-engaging-gen-z-recruitment-1ifie4a/",
      image: "/streamer.png", // Using existing placeholder
   },
   {
      id: 2,
      title: "New live stream management experience",
      text: "Discover the new live stream management experience, designed to enhance your workflow with easily accessible metrics, streamlined navigation, and a clearer overview",
      cta: "Discover now",
      url: "/group/[groupId]/admin/content/sparks",
      image: "/computer.png", // Using existing placeholder
   },
   {
      id: 3,
      title: "Promote your offline events",
      text: "Showcase your career fairs, info sessions, and on-campus events to a targeted audience already engaged with your company. Increase registrations and attendance by leveraging our platform.",
      cta: "Talk to us",
      url: "https://meetings.hubspot.com/denis-lehn-koza/clientdemocallcalender",
      image: "/next-livestreams-side.jpg", // Using existing placeholder
   },
]

const GuidesCard = () => {
   const [currentIndex, setCurrentIndex] = useState(0)
   const router = useRouter()
   const { groupId } = router.query

   const handlePrevious = () => {
      setCurrentIndex((prev) => (prev === 0 ? guideCards.length - 1 : prev - 1))
   }

   const handleNext = () => {
      setCurrentIndex((prev) => (prev === guideCards.length - 1 ? 0 : prev + 1))
   }

   const handleIndicatorClick = (index: number) => {
      setCurrentIndex(index)
   }

   const handleCTAClick = (card: GuideCard) => {
      if (card.url.startsWith("http")) {
         window.open(card.url, "_blank", "noopener,noreferrer")
      } else {
         const url = card.url.replace("[groupId]", groupId as string)
         router.push(url)
      }
   }

   return (
      <CardCustom title="Guides" sx={{ height: "422px" }}>
         <Box sx={styles.carouselContainer}>
            <Box sx={styles.carousel}>
               <Box
                  sx={{
                     ...styles.cardContainer,
                     transform: `translateX(-${currentIndex * 100}%)`,
                  }}
               >
                  {guideCards.map((card) => (
                     <Box key={card.id} sx={styles.card} data-testid={`guide-card-${card.id}`}>
                        <img
                           src={card.image}
                           alt={card.title}
                           style={styles.cardImage}
                        />
                        <Typography variant="h6" sx={styles.cardTitle}>
                           {card.title}
                        </Typography>
                        <Typography variant="body2" sx={styles.cardText}>
                           {card.text}
                        </Typography>
                        <Button
                           variant="outlined"
                           sx={styles.ctaButton}
                           onClick={() => handleCTAClick(card)}
                           data-testid={`guide-cta-${card.id}`}
                        >
                           {card.cta}
                        </Button>
                     </Box>
                  ))}
               </Box>
            </Box>

            <Button
               sx={[styles.navigationButton, styles.prevButton]}
               onClick={handlePrevious}
               disabled={currentIndex === 0}
               data-testid="guides-prev-button"
               aria-label="Previous guide"
            >
               <ChevronLeft size={20} />
            </Button>

            <Button
               sx={[styles.navigationButton, styles.nextButton]}
               onClick={handleNext}
               disabled={currentIndex === guideCards.length - 1}
               data-testid="guides-next-button"
               aria-label="Next guide"
            >
               <ChevronRight size={20} />
            </Button>

            <Box sx={styles.indicators} data-testid="guides-indicators">
               {guideCards.map((_, index) => (
                  <Box
                     key={index}
                     sx={[
                        styles.indicator,
                        index === currentIndex && { backgroundColor: "primary.main" },
                     ]}
                     onClick={() => handleIndicatorClick(index)}
                     data-testid={`guides-indicator-${index}`}
                     aria-label={`Go to guide ${index + 1}`}
                  />
               ))}
            </Box>
         </Box>
      </CardCustom>
   )
}

export default GuidesCard