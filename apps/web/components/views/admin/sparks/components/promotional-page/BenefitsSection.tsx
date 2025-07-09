import { Box, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useEmblaCarousel from "embla-carousel-react"
import { GenericCarousel } from "../../../../common/carousels/GenericCarousel"
import { benefitCardsData } from "./benefitCardsData"
import {
   StyledBenefitCard,
   StyledBenefitsGrid,
   StyledBenefitsSection,
} from "./styles"

const BenefitCard = ({ card }: { card: (typeof benefitCardsData)[0] }) => (
   <StyledBenefitCard>
      {card.mockupContent}
      <Box textAlign="center">
         <Typography variant="h6" fontWeight={600} color="#3D3D47" gutterBottom>
            {card.title}
         </Typography>
         <Typography variant="body2" color="#5C5C6A">
            {card.description}
         </Typography>
      </Box>
   </StyledBenefitCard>
)

const BenefitsSection = () => {
   const isMobile = useIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel({
      align: "start",
      containScroll: "trimSnaps",
   })

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

export default BenefitsSection
