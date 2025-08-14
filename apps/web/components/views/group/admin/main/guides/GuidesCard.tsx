import { Box, Button, Typography } from "@mui/material"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import { useRouter } from "next/router"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"

const styles = sxStyles({
   cardContainer: {
      height: "422px",
   },
   cardContent: {
      "& .MuiCardContent-root": {
         height: "100%",
         padding: 2,
         display: "flex",
         flexDirection: "column",
      },
   },
   carouselContainer: {
      position: "relative",
      height: "322px",
      overflow: "hidden",
   },
   carouselWrapper: {
      display: "flex",
      transition: "transform 0.3s ease-in-out",
      height: "100%",
   },
   carouselCard: {
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
      borderRadius: "4px",
   },
   cardTitle: {
      fontWeight: 600,
      fontSize: "1.1rem",
      lineHeight: "1.4",
      marginTop: 2,
      marginBottom: 1,
   },
   cardText: {
      fontSize: "0.9rem",
      lineHeight: "1.5",
      color: "text.secondary",
      marginBottom: 2,
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
      fontWeight: 500,
      "&:hover": {
         backgroundColor: "neutral.50",
         borderColor: "neutral.300",
      },
   },
   navigationContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
      gap: 1,
   },
   navButton: {
      minWidth: "32px",
      width: "32px",
      height: "32px",
      padding: 0,
      border: "1px solid",
      borderColor: "neutral.200",
      backgroundColor: "transparent",
      color: "neutral.600",
      "&:hover": {
         backgroundColor: "neutral.50",
         borderColor: "neutral.300",
      },
      "&:disabled": {
         opacity: 0.5,
         cursor: "not-allowed",
      },
   },
   indicators: {
      display: "flex",
      gap: 0.5,
   },
   indicator: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: "neutral.200",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&.active": {
         backgroundColor: "neutral.600",
      },
   },
})

interface GuideCard {
   title: string
   text: string
   cta: string
   url: string
   image: string
}

const guideCards: GuideCard[] = [
   {
      title: "Host live streams that attract and engage top talent",
      text: "Learn the three key stages before, during and after the event to plan effectively, present with impact and follow up for measurable recruitment results.",
      cta: "Read the full guide",
      url: "https://support.careerfairy.io/en/article/live-stream-your-way-to-top-talent-a-guide-to-engaging-gen-z-recruitment-1ifie4a/",
      image: "/images/guides/livestream-guide.jpg", // Placeholder image path
   },
   {
      title: "New Live stream management experience",
      text: "Discover the new Live stream management experience, designed to enhance your workflow with easily accessible metrics, streamlined navigation, and a clearer overview.",
      cta: "Discover now",
      url: "https://careerfairy-ssr-webapp-pr-1737.vercel.app/group/[groupId]/admin/content/live-streams",
      image: "/images/guides/management-experience.jpg", // Placeholder image path
   },
   {
      title: "Promote your offline events",
      text: "Showcase your career fairs, info sessions, and on-campus events to a targeted audience already engaged with your company. Increase registrations and attendance by leveraging our platform.",
      cta: "Talk to us",
      url: "https://meetings.hubspot.com/denis-lehn-koza/clientdemocallcalender",
      image: "/images/guides/offline-events.jpg", // Placeholder image path
   },
]

const GuidesCard = () => {
   const [currentIndex, setCurrentIndex] = useState(0)
   const router = useRouter()
   const { groupId } = router.query

   const handleNext = () => {
      setCurrentIndex((prev) => (prev + 1) % guideCards.length)
   }

   const handlePrev = () => {
      setCurrentIndex((prev) => (prev - 1 + guideCards.length) % guideCards.length)
   }

   const handleIndicatorClick = (index: number) => {
      setCurrentIndex(index)
   }

   const handleCtaClick = (url: string) => {
      // Replace [groupId] placeholder with actual groupId
      const finalUrl = url.replace("[groupId]", groupId as string)
      
      if (url.startsWith("http")) {
         // External URL
         window.open(finalUrl, "_blank", "noopener,noreferrer")
      } else {
         // Internal URL
         router.push(finalUrl)
      }
   }

   return (
      <CardCustom
         title="Guides"
         sx={[styles.cardContainer, styles.cardContent]}
      >
         <Box sx={styles.carouselContainer}>
            <Box
               sx={[
                  styles.carouselWrapper,
                  {
                     transform: `translateX(-${currentIndex * 100}%)`,
                  },
               ]}
            >
               {guideCards.map((card, index) => (
                  <Box key={index} sx={styles.carouselCard}>
                     <img
                        src={card.image}
                        alt={card.title}
                        style={styles.cardImage}
                        onError={(e) => {
                           // Fallback to a default image or placeholder
                           e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='140' viewBox='0 0 100 140'%3E%3Crect width='100' height='140' fill='%23f5f5f5'/%3E%3Ctext x='50' y='70' text-anchor='middle' font-family='Arial' font-size='12' fill='%23999'%3EGuide Image%3C/text%3E%3C/svg%3E"
                        }}
                     />
                     <Typography variant="h6" sx={styles.cardTitle}>
                        {card.title}
                     </Typography>
                     <Typography sx={styles.cardText}>
                        {card.text}
                     </Typography>
                     <Button
                        sx={styles.ctaButton}
                        onClick={() => handleCtaClick(card.url)}
                     >
                        {card.cta}
                     </Button>
                  </Box>
               ))}
            </Box>
         </Box>
         
         <Box sx={styles.navigationContainer}>
            <Button
               sx={styles.navButton}
               onClick={handlePrev}
               disabled={currentIndex === 0}
            >
               <ChevronLeft size={16} />
            </Button>
            
            <Box sx={styles.indicators}>
               {guideCards.map((_, index) => (
                  <Box
                     key={index}
                     sx={[
                        styles.indicator,
                        currentIndex === index && { backgroundColor: "neutral.600" },
                     ]}
                     onClick={() => handleIndicatorClick(index)}
                  />
               ))}
            </Box>
            
            <Button
               sx={styles.navButton}
               onClick={handleNext}
               disabled={currentIndex === guideCards.length - 1}
            >
               <ChevronRight size={16} />
            </Button>
         </Box>
      </CardCustom>
   )
}

export default GuidesCard