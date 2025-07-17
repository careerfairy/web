import { GroupPlanTypes } from "@careerfairy/shared-lib/groups"
import { LoadingButton } from "@mui/lab"
import { Box, Button, CardContent, Stack, Typography } from "@mui/material"
import { useGroupTalentEngagement } from "components/custom-hook/group/useGroupTalentEngagement"
import { useStartPlanMutation } from "components/custom-hook/group/useStartPlanMutation"
import { useGroup } from "layouts/GroupDashboardLayout"
import { useRouter } from "next/router"
import { BarChart, Calendar, PlayCircle, Target } from "react-feather"
import {
   StyledBrandAwarenessCard,
   StyledCardBenefits,
   StyledFullCard,
   StyledHeroContent,
   StyledLinearProgress,
   StyledPricingSection,
   StyledProgressHeader,
   StyledProgressIcon,
   StyledProgressSection,
   StyledTrialCard,
   StyledTrialCardFreeTag,
   StyledTrialCardTitle,
} from "./hero-section-styles"

export const HeroSection = () => {
   const { group } = useGroup()
   const { push } = useRouter()
   const { data: talentEngagement, isLoading: talentEngagementLoading } =
      useGroupTalentEngagement(group)

   const { trigger, isMutating } = useStartPlanMutation(group.id, {
      onSuccess: () => {
         push(`/group/${group.id}/admin/content/sparks`)
      },
   })

   const handleStartTrial = () => {
      trigger({
         planType: GroupPlanTypes.Trial,
         groupId: group.id,
      })
   }

   // Calculate progress value before passing as prop
   const progressValue =
      talentEngagement?.total && talentEngagement.total > 0
         ? (talentEngagement.count / talentEngagement.total) * 100
         : 0

   return (
      <StyledHeroContent>
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
                  <StyledLinearProgress
                     variant="determinate"
                     value={progressValue}
                  />
                  <Typography
                     variant="xsmall"
                     component="span"
                     color="neutral.500"
                  >
                     {talentEngagementLoading
                        ? "Loading..."
                        : `${talentEngagement?.count || 0}/${
                             talentEngagement?.total || 0
                          } talent engaged`}
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
               <StyledTrialCardFreeTag>Free</StyledTrialCardFreeTag>
               <LoadingButton
                  variant="contained"
                  fullWidth
                  color="secondary"
                  size="small"
                  onClick={handleStartTrial}
                  loading={isMutating}
               >
                  Start trial now!
               </LoadingButton>
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
                  href="https://library.careerfairy.io/meetings/kandeeban/sparks"
                  target="_blank"
               >
                  Contact us
               </Button>
            </StyledFullCard>
         </StyledPricingSection>
      </StyledHeroContent>
   )
}
