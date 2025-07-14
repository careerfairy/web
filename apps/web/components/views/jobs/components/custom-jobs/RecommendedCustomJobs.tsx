import { Box, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useUserRecommendedJobs } from "components/custom-hook/custom-job/useRecommendedJobs"
import { GenericCarousel } from "components/views/common/carousels/GenericCarousel"
import JobCard from "components/views/common/jobs/JobCard"
import { JobCardSkeleton } from "components/views/streaming-page/components/jobs/JobListSkeleton"
import useEmblaCarousel from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   heading: {
      fontWeight: 600,
      m: 2,
   },
   wrapper: {
      m: 0,
      p: 0,
   },
   carouselContainer: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
   },
   jobListWrapper: {
      px: { xs: 2, md: 2 },
      pb: { xs: 3, md: 3 },
      width: "100%",
      height: "250px",
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
         <Typography
            variant="brandedH4"
            sx={styles.heading}
            color="neutral.800"
         >
            Recommended jobs
         </Typography>
         <Content userCountryCode={userCountryCode} />
      </Stack>
   )
}

const Content = ({ userCountryCode }: RecommendedCustomJobsProps) => {
   const { data: customJobs, isLoading } = useUserRecommendedJobs({
      limit: 10,
      countryCode: userCountryCode,
   })

   const [emblaRef, emblaApi] = useEmblaCarousel(
      {
         loop: false,
         axis: "x",
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
         <GenericCarousel
            emblaRef={emblaRef}
            emblaApi={emblaApi}
            gap="12px"
            preventEdgeTouch
         >
            {customJobs.map((customJob) => (
               <GenericCarousel.Slide key={customJob.id} slideWidth="320px">
                  <SuspenseWithBoundary
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
                        href={`/jobs?currentJobId=${customJob.id}`}
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
               </GenericCarousel.Slide>
            ))}
         </GenericCarousel>
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
