import { Box, Button, Stack, Typography } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"
import CardCustom from "../../common/CardCustom"

const styles = sxStyles({
   carouselContainer: {
      position: "relative",
      padding: "0px", // No padding around guide cards
      display: "flex",
      flexDirection: "column",
   },
   carousel: {
      position: "relative",
      flex: 1,
      overflow: "hidden",
   },
   cardContainer: {
      display: "flex",
      transition: "transform 0.3s ease-in-out",
      height: "100%",
   },
   card: {
      minWidth: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: 0, // No card padding
      marginBottom: "12px", // 12px margin between card and navigation dots
   },
   cardImageWrapper: {
      width: "100%",
      height: "140px",
      position: "relative",
      borderRadius: "8px",
      overflow: "hidden",
      marginBottom: "12px", // Bottom padding for image
   },
   cardTitle: {
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: "24px",
      marginBottom: "12px", // Bottom padding for title
   },
   cardText: {
      fontSize: "14px",
      lineHeight: "20px",
      color: "text.secondary",
      marginBottom: "12px", // Bottom padding for text
   },
   ctaButton: {
      height: "40px",
      border: "1px solid",
      borderColor: "neutral.200",
      backgroundColor: "transparent",
      color: "neutral.600",
      textTransform: "none",
      fontSize: "14px",
      fontWeight: 500,
      padding: "0 16px", // Dynamic width with padding
      "&:hover": {
         backgroundColor: (theme) => theme.brand.black[400],
         borderColor: "neutral.50",
      },
   },

   navigationButton: {
      minWidth: "32px",
      width: "32px",
      height: "32px",
      borderRadius: "50%", // Make it a perfect circle
      backgroundColor: "neutral.50",
      border: "none",
      color: "neutral.600", // Use neutral 600 for icons
      padding: 0, // Remove default padding
      "&:hover": {
         backgroundColor: "neutral.100",
      },
      "&:disabled": {
         opacity: 0.3,
      },
   },
   indicators: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
   },
   indicator: {
      width: "12px",
      height: "12px",
      borderRadius: "6px",
      backgroundColor: "neutral.100",
      cursor: "pointer",
      transition: "all 0.2s ease",
   },
   indicatorActive: {
      width: "34px",
      height: "12px",
      backgroundColor: "neutral.400",
   },
})

type GuideCard = {
   id: number
   title: string
   text: string
   cta: string
   url: string
   image: string
   isExternal: boolean
}

const guideCards: GuideCard[] = [
   {
      id: 1,
      title: "Host live streams that attract and engage top talent",
      text: "Learn the three key stages before, during and after the event to plan effectively, present with impact and follow up for measurable recruitment results.",
      cta: "Read the full guide",
      url: "https://support.careerfairy.io/en/article/live-stream-your-way-to-top-talent-a-guide-to-engaging-gen-z-recruitment-1ifie4a/",
      image: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/livestream.png?alt=media&token=29355bf7-6ef0-4646-8291-5cf6f476fecc",
      isExternal: true,
   },
   {
      id: 2,
      title: "New live stream management experience",
      text: "Discover the new live stream management experience, designed to enhance your workflow with easily accessible metrics, streamlined navigation, and a clearer overview.",
      cta: "Discover now",
      url: "/group/[groupId]/admin/content/live-streams",
      image: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/ls-management.png?alt=media&token=1bbe8e2b-b9fe-49b4-8d09-eef69cda8539",
      isExternal: false,
   },
   {
      id: 3,
      title: "Promote your offline events",
      text: "Showcase your career fairs, info sessions, and on-campus events to a targeted audience already engaged with your company. Increase registrations and attendance by leveraging our platform.",
      cta: "Talk to us",
      url: "https://meetings.hubspot.com/denis-lehn-koza/clientdemocallcalender",
      image: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/offline.png?alt=media&token=83692ead-e6f4-4d9d-b564-125101fbb79b",
      isExternal: true,
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

   const getResolvedUrl = (card: GuideCard): string => {
      if (card.isExternal) {
         return card.url
      }
      return card.url.replace("[groupId]", groupId as string)
   }

   const customAction = (
      <Box sx={{ display: "flex", gap: "8px" }}>
         <Button
            sx={styles.navigationButton}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            data-testid="guides-prev-button"
            aria-label="Previous guide"
         >
            <ChevronLeft size={16} />
         </Button>

         <Button
            sx={styles.navigationButton}
            onClick={handleNext}
            disabled={currentIndex === guideCards.length - 1}
            data-testid="guides-next-button"
            aria-label="Next guide"
         >
            <ChevronRight size={16} />
         </Button>
      </Box>
   )

   return (
      <CardCustom 
         title="Guides" 
         sx={{
            "& .MuiCardContent-root": {
               padding: "16px",
            },
            "& .MuiCardHeader-root": {
               padding: "16px",
            },
         }}
         customAction={customAction}
      >
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
                        <Box sx={styles.cardImageWrapper}>
                           <Image
                              src={card.image}
                              alt={card.title}
                              fill
                              style={{ objectFit: "cover" }}
                              draggable={false}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           />
                        </Box>
                        <Typography variant="h6" sx={styles.cardTitle}>
                           {card.title}
                        </Typography>
                        <Typography variant="body2" sx={styles.cardText}>
                           {card.text}
                        </Typography>
                        <Button
                           variant="outlined"
                           sx={styles.ctaButton}
                           component={Link}
                           href={getResolvedUrl(card)}
                           target={card.isExternal ? "_blank" : undefined}
                           rel={card.isExternal ? "noopener noreferrer" : undefined}
                           data-testid={`guide-cta-${card.id}`}
                        >
                           {card.cta}
                        </Button>
                     </Box>
                  ))}
               </Box>
            </Box>

            <Box sx={styles.indicators} data-testid="guides-indicators">
               {guideCards.map((_, index) => (
                  <Box
                     key={index}
                     sx={[
                        styles.indicator,
                        index === currentIndex && styles.indicatorActive,
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