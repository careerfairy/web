import { Box, Stack, styled, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { GenericCarousel } from "../../../../common/carousels/GenericCarousel"

import { ReactNode } from "react"
import { AnalyticsMockup } from "./AnalyticsMockup"
import { EngagementMockup } from "./EngagementMockup"
import { LivestreamMockup } from "./LivestreamMockup"
import { StudentMockup } from "./StudentMockup"

export const StyledBenefitsSection = styled(Box)(({ theme }) => ({
   backgroundColor: theme.brand.white[300],
   borderRadius: "12px",
   padding: "24px",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: "16px",
   width: "100%",
   maxWidth: "942px",
   [theme.breakpoints.down("md")]: {
      padding: "8px",
      maxWidth: "none",
      gap: "12px",
   },
}))

export const StyledBenefitsGrid = styled(Box)(({ theme }) => ({
   display: "grid",
   gridTemplateColumns: "repeat(2, 1fr)",
   gap: "16px",
   width: "100%",
   [theme.breakpoints.down("md")]: {
      display: "none",
   },
}))

export const StyledBenefitCard = styled(Box)(({ theme }) => ({
   backgroundColor: theme.brand.white[50],
   borderRadius: "8px",
   padding: "12px",
   display: "flex",
   flexDirection: "column",
   gap: "12px",
   [theme.breakpoints.down("md")]: {
      minWidth: "299px",
      padding: "8px",
   },
}))

type BenefitCardData = {
   id: string
   mockupContent: ReactNode
   title: string
   description: ReactNode
}

export const benefitCardsData: BenefitCardData[] = [
   {
      id: "students",
      mockupContent: <StudentMockup />,
      title: "Get in front of the right students",
      description:
         "Target by study field, degree level, and more to engage students and build your pipeline",
   },
   {
      id: "engagement",
      mockupContent: <EngagementMockup />,
      title: "Easy to make, hard to ignore",
      description: (
         <>
            Quick to create, no big production needed. Authentic videos that
            perform best with Gen&nbsp;Z
         </>
      ),
   },
   {
      id: "analytics",
      mockupContent: <AnalyticsMockup />,
      title: "Understand what's working",
      description:
         "Track views, likes and shares in real time to double down on what students actually care about",
   },
   {
      id: "livestreams",
      mockupContent: <LivestreamMockup />,
      title: "Get more out of your Live Streams",
      description:
         "Use Sparks to warm up student interest early, so more of them join your events and apply afterward",
   },
]

type BenefitCardProps = {
   card: BenefitCardData
}

const BenefitCard = ({ card }: BenefitCardProps) => (
   <StyledBenefitCard>
      {card.mockupContent}
      <Stack spacing={0.5} textAlign="center">
         <Typography
            variant="medium"
            component="h6"
            fontWeight={600}
            color="neutral.800"
         >
            {card.title}
         </Typography>
         <Typography variant="medium" color="neutral.700" component="p">
            {card.description}
         </Typography>
      </Stack>
   </StyledBenefitCard>
)

const autoplay = Autoplay({ playOnInit: true, delay: 7000 })

export const BenefitsSection = () => {
   const isMobile = useIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         align: "start",
         containScroll: "trimSnaps",
      },
      [autoplay]
   )

   return (
      <StyledBenefitsSection>
         <Typography
            variant={isMobile ? "mobileBrandedH3" : "desktopBrandedH4"}
            component="h3"
            fontWeight={700}
            textAlign="center"
            color="neutral.800"
            maxWidth="76%"
         >
            What&nbsp;Sparks&nbsp;videos can&nbsp;offer&nbsp;you?
         </Typography>

         {/* Desktop Grid */}
         <StyledBenefitsGrid>
            {benefitCardsData.map((card) => (
               <BenefitCard key={card.id} card={card} />
            ))}
         </StyledBenefitsGrid>

         {/* Mobile Carousel */}
         {Boolean(isMobile) && (
            <GenericCarousel
               emblaRef={emblaRef}
               emblaApi={emblaApi}
               gap="8px"
               sx={{ width: "100%" }}
            >
               {benefitCardsData.map((card) => (
                  <GenericCarousel.Slide key={card.id} slideWidth="299px">
                     <BenefitCard card={card} />
                  </GenericCarousel.Slide>
               ))}
            </GenericCarousel>
         )}
      </StyledBenefitsSection>
   )
}
