import { Box, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useEmblaCarousel from "embla-carousel-react"
import { Eye, ThumbsUp } from "react-feather"
import { GenericCarousel } from "../../../../common/carousels/GenericCarousel"
import {
   StyledBenefitCard,
   StyledBenefitsGrid,
   StyledBenefitsSection,
   StyledMockupContainer,
} from "./styles"

const BenefitsSection = () => {
   const isMobile = useIsMobile()

   const [emblaRef, emblaApi] = useEmblaCarousel({
      align: "start",
      containScroll: "trimSnaps",
   })

   const benefitCards = [
      {
         id: "students",
         mockupContent: (
            <StyledMockupContainer>
               {/* Student profiles mockup */}
               <Box
                  display="flex"
                  gap="8px"
                  flexWrap="wrap"
                  justifyContent="center"
               >
                  <Box
                     sx={{
                        width: "60px",
                        height: "80px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "8px",
                        gap: "4px",
                     }}
                  >
                     <Box
                        sx={{
                           width: "32px",
                           height: "32px",
                           borderRadius: "50%",
                           backgroundColor: "#9581EE",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="8px"
                        textAlign="center"
                     >
                        Anna Schmidt
                     </Typography>
                     <Typography variant="caption" fontSize="7px" color="grey">
                        Finance
                     </Typography>
                  </Box>
                  <Box
                     sx={{
                        width: "60px",
                        height: "80px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "8px",
                        gap: "4px",
                     }}
                  >
                     <Box
                        sx={{
                           width: "32px",
                           height: "32px",
                           borderRadius: "50%",
                           backgroundColor: "#FBD550",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="8px"
                        textAlign="center"
                     >
                        Lukas Müller
                     </Typography>
                     <Typography variant="caption" fontSize="7px" color="grey">
                        Business
                     </Typography>
                  </Box>
                  <Box
                     sx={{
                        width: "60px",
                        height: "80px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "8px",
                        gap: "4px",
                        boxShadow: "0px 0px 42px 0px rgba(20, 20, 20, 0.08)",
                     }}
                  >
                     <Box
                        sx={{
                           width: "32px",
                           height: "32px",
                           borderRadius: "50%",
                           backgroundColor: "#00D2AA",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="8px"
                        textAlign="center"
                     >
                        Clara Müller
                     </Typography>
                     <Typography variant="caption" fontSize="7px" color="grey">
                        Computer science
                     </Typography>
                  </Box>
               </Box>
            </StyledMockupContainer>
         ),
         title: "Get in front of the right students",
         description:
            "Target by study field, degree level, and more to engage students and build your pipeline",
      },
      {
         id: "engagement",
         mockupContent: (
            <Box
               sx={{
                  backgroundColor: "#FBF5E6",
                  borderRadius: "4px",
                  height: "158px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               {/* Social media mockup */}
               <Box
                  sx={{
                     width: "120px",
                     height: "160px",
                     backgroundColor: "rgba(255, 182, 0, 0.2)",
                     borderRadius: "8px",
                     position: "relative",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                  }}
               >
                  <Box
                     display="flex"
                     gap="4px"
                     position="absolute"
                     bottom="20px"
                     right="20px"
                  >
                     <ThumbsUp size={16} color="#FE9B0E" />
                     <ThumbsUp size={18} color="#FE9B0E" />
                     <ThumbsUp size={20} color="#FE9B0E" />
                     <ThumbsUp size={22} color="#FE9B0E" />
                  </Box>
               </Box>
            </Box>
         ),
         title: "Easy to make, hard to ignore",
         description:
            "Quick to create, no big production needed. Authentic videos that perform best with Gen Z",
      },
      {
         id: "analytics",
         mockupContent: (
            <Box
               sx={{
                  backgroundColor: "#E6FBED",
                  borderRadius: "4px",
                  height: "158px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               {/* Analytics mockup */}
               <Box
                  sx={{
                     backgroundColor: "white",
                     borderRadius: "50px",
                     padding: "16px 24px",
                     display: "flex",
                     alignItems: "center",
                     gap: "12px",
                     border: "1px solid #00D247",
                     boxShadow: "0px 0px 60px 9px rgba(17, 226, 87, 0.22)",
                  }}
               >
                  <Eye size={24} color="#3D3D47" />
                  <Typography variant="h6" color="#3D3D47">
                     1.328
                  </Typography>
               </Box>
               <Box
                  sx={{
                     position: "absolute",
                     top: "20px",
                     right: "20px",
                     backgroundColor: "#00D247",
                     borderRadius: "16px",
                     padding: "4px 8px",
                     display: "flex",
                     alignItems: "center",
                     gap: "4px",
                  }}
               >
                  <Typography variant="caption" color="white" fontWeight={400}>
                     +75%
                  </Typography>
               </Box>
            </Box>
         ),
         title: "Understand what&apos;s working",
         description:
            "Track views, likes and shares in real time to double down on what students actually care about",
      },
      {
         id: "livestreams",
         mockupContent: (
            <Box
               sx={{
                  backgroundColor: "#F3EDFD",
                  borderRadius: "4px",
                  height: "158px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               {/* Live stream mockup */}
               <Box
                  sx={{
                     width: "140px",
                     height: "100px",
                     backgroundColor: "white",
                     borderRadius: "8px",
                     border: "2px solid white",
                     position: "relative",
                  }}
               >
                  <Box
                     sx={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "#856DEE",
                        borderRadius: "12px",
                        padding: "2px 4px",
                        border: "1px solid #EFE9F9",
                     }}
                  >
                     <Box display="flex" flexDirection="column" gap="1px">
                        <Box
                           sx={{
                              width: "4px",
                              height: "2px",
                              backgroundColor: "white",
                           }}
                        />
                        <Box
                           sx={{
                              width: "4px",
                              height: "2px",
                              backgroundColor: "rgba(255,255,255,0.5)",
                           }}
                        />
                        <Box
                           sx={{
                              width: "4px",
                              height: "2px",
                              backgroundColor: "rgba(255,255,255,0.2)",
                           }}
                        />
                     </Box>
                  </Box>
                  <Box
                     sx={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        right: "8px",
                        height: "12px",
                        backgroundColor: "rgba(253, 252, 255, 0.78)",
                        backdropFilter: "blur(16px)",
                        borderRadius: "4px",
                     }}
                  />
               </Box>
            </Box>
         ),
         title: "Get more out of your Live Streams",
         description:
            "Use Sparks to warm up student interest early, so more of them join your events and apply afterward",
      },
   ]

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
            {benefitCards.map((card) => (
               <StyledBenefitCard key={card.id}>
                  {card.mockupContent}
                  <Box textAlign="center">
                     <Typography
                        variant="h6"
                        fontWeight={600}
                        color="#3D3D47"
                        gutterBottom
                     >
                        {card.title}
                     </Typography>
                     <Typography variant="body2" color="#5C5C6A">
                        {card.description}
                     </Typography>
                  </Box>
               </StyledBenefitCard>
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
               {benefitCards.map((card) => (
                  <GenericCarousel.Slide key={card.id} slideWidth="299px">
                     <StyledBenefitCard>
                        {card.mockupContent}
                        <Box textAlign="center">
                           <Typography
                              variant="h6"
                              fontWeight={600}
                              color="#3D3D47"
                              gutterBottom
                           >
                              {card.title}
                           </Typography>
                           <Typography variant="body2" color="#5C5C6A">
                              {card.description}
                           </Typography>
                        </Box>
                     </StyledBenefitCard>
                  </GenericCarousel.Slide>
               ))}
            </GenericCarousel>
         )}
      </StyledBenefitsSection>
   )
}

export default BenefitsSection
