import { Box, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import JobCard from "components/views/common/jobs/JobCard"
import { buildRelativeJobPostingLink } from "components/views/common/jobs/utils"
import { SeeAllLink } from "components/views/company-page/Overview/SeeAllLink"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   wrapper: {
      m: 0,
      p: 0,
   },
   carouselContainer: {
      pb: { xs: 3, md: 3 },
   },
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
      height: "250px",
   },
   headerRight: {
      pr: 2,
   },
   header: {
      pl: 2,
   },
   contentCarouselContainer: {
      px: { xs: 2, md: 2 },
   },
})

type RecommendedCustomJobsProps = {
   userCountryCode?: string
}

export const RecommendedCustomJobs = ({
   userCountryCode,
}: RecommendedCustomJobsProps) => {
   return (
      <Stack spacing={0} sx={styles.wrapper} id="highlighted-jobs">
         <Content userCountryCode={userCountryCode} />
      </Stack>
   )
}

const Content = ({ userCountryCode }: RecommendedCustomJobsProps) => {
   const { isLoggedIn } = useAuth()
   const { data: customJobs, isLoading } = useUserRecommendedJobs({
      limit: 10,
      countryCode: userCountryCode,
   })

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
         dragFree: true,
         skipSnaps: true,
      },
      [WheelGesturesPlugin()]
   )

   if (isLoading) {
      return <RecommendedCustomJobsSkeleton />
   }

   if (!customJobs?.length) {
      return null
   }

   return (
      <Box sx={styles.carouselContainer}>
         <ContentCarousel
            slideWidth={320}
            headerTitle={
               <Typography variant="brandedH4" fontWeight={600}>
                  {isLoggedIn ? "Recommended jobs" : "Trending jobs"}
               </Typography>
            }
            seeAll={<SeeAllLink href="/jobs" />}
            emblaProps={{
               emblaRef,
               emblaApi,
               emblaOptions: {
                  loop: false,
                  axis: "x",
                  dragFree: true,
                  skipSnaps: true,
               },
            }}
            containerSx={styles.contentCarouselContainer}
            headerRightSx={styles.headerRight}
            headerSx={styles.header}
            disableArrows={false}
         >
            {customJobs.map((customJob) => (
               <SuspenseWithBoundary
                  key={customJob.id}
                  fallback={
                     <Box width="100%">
                        <JobCardSkeleton />
                     </Box>
                  }
               >
                  <Box
                     maxWidth="320px"
                     minWidth="320px"
                     component={Link}
                     href={buildRelativeJobPostingLink({
                        jobId: customJob.id,
                     })}
                  >
                     <JobCard
                        job={customJob}
                        previewMode
                        hideJobUrl
                        smallCard
                        showCompanyLogo
                        companyLogoUrl={customJob.group?.logoUrl}
                        companyName={customJob.group?.universityName}
                     />
                  </Box>
               </SuspenseWithBoundary>
            ))}
         </ContentCarousel>
      </Box>
   )
}

export const RecommendedCustomJobsSkeleton = () => {
   return (
      <Stack sx={styles.jobListWrapper} spacing={1} direction="row">
         <JobCardSkeleton />
         <JobCardSkeleton />
         <JobCardSkeleton />
      </Stack>
   )
}
