import { Box, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import useEmblaCarousel from "embla-carousel-react"
import { Eye, ThumbsUp } from "react-feather"
import { GenericCarousel } from "../../../../common/carousels/GenericCarousel"
import {
   StyledBenefitCard,
   StyledBenefitsGrid,
   StyledBenefitsSection,
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
            <Box
               sx={{
                  backgroundColor: "#E6F3FB",
                  borderRadius: "4px",
                  height: "158px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  position: "relative",
               }}
            >
               {/* Student profiles mockup with overlapping cards */}
               <Box
                  sx={{
                     position: "relative",
                     width: "100%",
                     maxWidth: "280px",
                     height: "118px",
                     margin: "0 auto",
                  }}
               >
                  {/* Anna Schmidt - Left card */}
                  <Box
                     sx={{
                        position: "absolute",
                        left: "5%",
                        top: "5px",
                        width: "80px",
                        height: "100px",
                        backgroundColor: "white",
                        borderRadius: "5px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "10px 3px",
                        gap: "3px",
                        zIndex: 1,
                     }}
                  >
                     <Box
                        component="img"
                        src="/student-avatars/anna-schmidt-avatar.png"
                        alt="Anna Schmidt"
                        sx={{
                           width: "56px",
                           height: "56px",
                           borderRadius: "50%",
                           objectFit: "cover",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="10px"
                        fontWeight={600}
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Anna Schmidt
                     </Typography>
                     <Typography
                        variant="caption"
                        fontSize="8.5px"
                        fontWeight={300}
                        color="grey"
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Finance
                     </Typography>
                  </Box>

                  {/* Lukas Müller - Center card (elevated) */}
                  <Box
                     sx={{
                        position: "absolute",
                        left: "50%",
                        top: "0px",
                        transform: "translateX(-50%)",
                        width: "76px",
                        height: "96px",
                        backgroundColor: "white",
                        borderRadius: "5px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "10px 3px",
                        gap: "3px",
                        boxShadow: "0px 0px 35px 0px rgba(20, 20, 20, 0.08)",
                        zIndex: 3,
                     }}
                  >
                     <Box
                        component="img"
                        src="/student-avatars/lukas-muller-avatar.png"
                        alt="Lukas Müller"
                        sx={{
                           width: "54px",
                           height: "54px",
                           borderRadius: "50%",
                           objectFit: "cover",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="10px"
                        fontWeight={600}
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Lukas Müller
                     </Typography>
                     <Typography
                        variant="caption"
                        fontSize="8.5px"
                        fontWeight={300}
                        color="grey"
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Business
                     </Typography>
                  </Box>

                  {/* Clara Müller - Right card */}
                  <Box
                     sx={{
                        position: "absolute",
                        right: "5%",
                        top: "5px",
                        width: "80px",
                        height: "100px",
                        backgroundColor: "white",
                        borderRadius: "5px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "10px 3px",
                        gap: "3px",
                        zIndex: 2,
                     }}
                  >
                     <Box
                        component="img"
                        src="/student-avatars/clara-muller-avatar.png"
                        alt="Clara Müller"
                        sx={{
                           width: "56px",
                           height: "56px",
                           borderRadius: "50%",
                           objectFit: "cover",
                        }}
                     />
                     <Typography
                        variant="caption"
                        fontSize="10px"
                        fontWeight={600}
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Clara Müller
                     </Typography>
                     <Typography
                        variant="caption"
                        fontSize="8.5px"
                        fontWeight={300}
                        color="grey"
                        textAlign="center"
                        lineHeight="1.5"
                     >
                        Computer science
                     </Typography>
                  </Box>
               </Box>
            </Box>
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
