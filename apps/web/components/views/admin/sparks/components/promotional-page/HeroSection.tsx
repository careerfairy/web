import {
   Box,
   Button,
   CardContent,
   LinearProgress,
   Stack,
   Typography,
} from "@mui/material"
import { BarChart, Calendar, PlayCircle, Target } from "react-feather"
import {
   StyledBrandAwarenessCard,
   StyledCardBenefits,
   StyledFullCard,
   StyledHeroSection,
   StyledPricingSection,
   StyledProgressHeader,
   StyledProgressIcon,
   StyledProgressSection,
   StyledTrialCard,
   StyledTrialCardTitle,
} from "./styles"

const HeroSection = () => {
   return (
      <StyledHeroSection>
         {/* Header */}
         <Stack alignItems="center" width="100%">
            <Typography
               variant="desktopBrandedH3"
               component="h3"
               fontWeight={700}
               textAlign="center"
               color="neutral.800"
            >
               Spark interest in seconds
            </Typography>
            <Typography
               variant="medium"
               textAlign="center"
               color="neutral.700"
               component="p"
            >
               Get seen by students who matter, in their style, with 60-second
               videos.
            </Typography>
         </Stack>

         {/* Brand Awareness Section */}
         <StyledBrandAwarenessCard>
            <StyledProgressSection>
               <StyledProgressHeader>
                  <StyledProgressIcon>
                     <BarChart size={28} color="#01AF3C" strokeWidth={4} />
                  </StyledProgressIcon>
                  <Typography
                     variant="medium"
                     component="h6"
                     fontWeight={600}
                     color="neutral.800"
                  >
                     What&apos;s your brand awareness level?
                  </Typography>
               </StyledProgressHeader>

               <Stack spacing={0.5}>
                  <LinearProgress
                     variant="determinate"
                     value={20}
                     sx={{
                        height: 14,
                        borderRadius: 100,
                        backgroundColor: "rgba(227, 233, 253, 0.56)",
                        "& .MuiLinearProgress-bar": {
                           backgroundColor: "#01AF3C",
                           borderRadius: "100px",
                        },
                     }}
                  />
                  <Typography
                     variant="xsmall"
                     component="span"
                     color="neutral.500"
                  >
                     1200/9500 talent engaged
                  </Typography>
               </Stack>
            </StyledProgressSection>

            <Typography variant="small" component="p" color="neutral.700">
               Showcase your culture, people, and purpose to build 4 times
               stronger brand recall that fuels Live Stream signups and job
               applications.
            </Typography>
         </StyledBrandAwarenessCard>

         {/* Pricing Cards */}
         <StyledPricingSection>
            <StyledTrialCard>
               <CardContent sx={{ p: "4px", "&:last-child": { pb: "4px" } }}>
                  <Box display="flex" flexDirection="column" gap="16px">
                     <Stack>
                        <StyledTrialCardTitle>SPARKS</StyledTrialCardTitle>
                        <Typography
                           variant="medium"
                           component="h6"
                           fontWeight={700}
                           color="common.white"
                           fontStyle="italic"
                           mt={-1.25}
                        >
                           Trial
                        </Typography>
                     </Stack>

                     <StyledCardBenefits spacing={1}>
                        <Box display="flex" alignItems="center" gap="4px">
                           <PlayCircle size={14} />
                           <Typography variant="small">6 videos</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="4px">
                           <BarChart size={14} />
                           <Typography variant="small">
                              Basic analytics
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="4px">
                           <Calendar size={14} />
                           <Typography variant="small">2 months</Typography>
                        </Box>
                     </StyledCardBenefits>
                  </Box>
               </CardContent>

               <Box
                  sx={{
                     position: "absolute",
                     top: -31,
                     right: 0,
                     backgroundColor: "#23546E",
                     color: "white",
                     padding: "4px 12px",
                     borderRadius: "4px",
                     fontSize: "14px",
                  }}
               >
                  Free
               </Box>

               <Button
                  variant="contained"
                  fullWidth
                  color="secondary"
                  size="small"
               >
                  Start trial now!
               </Button>
            </StyledTrialCard>

            <StyledFullCard>
               <CardContent sx={{ p: "4px", "&:last-child": { pb: "4px" } }}>
                  <Box display="flex" flexDirection="column" gap="16px">
                     <Box>
                        <StyledTrialCardTitle>SPARKS</StyledTrialCardTitle>
                        <Typography variant="small" color="common.white">
                           Boost your employer brand with short videos on
                           CareerFairy, visible to students all year round.
                        </Typography>
                     </Box>

                     <StyledCardBenefits spacing={1}>
                        <Box display="flex" alignItems="center" gap="4px">
                           <PlayCircle size={14} />
                           <Typography variant="small">
                              Unlimited videos
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="4px">
                           <BarChart size={14} />
                           <Typography variant="small">
                              Advanced analytics
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="4px">
                           <Target size={14} />
                           <Typography variant="small">
                              Competitor analytics
                           </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap="4px">
                           <Calendar size={14} />
                           <Typography variant="small">12 months</Typography>
                        </Box>
                     </StyledCardBenefits>
                  </Box>
               </CardContent>

               <Button
                  variant="outlined"
                  fullWidth
                  color="secondary"
                  size="small"
               >
                  Contact us
               </Button>
            </StyledFullCard>
         </StyledPricingSection>
      </StyledHeroSection>
   )
}

export default HeroSection
