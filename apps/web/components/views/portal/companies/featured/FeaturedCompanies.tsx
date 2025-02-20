import { FieldOfStudyCategoryMap } from "@careerfairy/shared-lib/fieldOfStudy"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Divider, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useFeaturedGroupsSWR } from "components/custom-hook/group/useFeaturedGroupsSWR"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import useIsMobile from "components/custom-hook/useIsMobile"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import Link from "next/link"
import { ChevronRight } from "react-feather"
import { FeaturedCompaniesCarousel } from "./FeaturedCompaniesCarousel"
import { FeaturedCompaniesHeader } from "./FeaturedCompaniesHeader"
import { MobileFeaturedCompaniesCarousel } from "./MobileFeaturedCompaniesCarousel"

const styles = sxStyles({
   root: {
      ml: 2,
      borderRadius: "16px",
      background: "linear-gradient(125deg, #5A86E2 0%, #5F9BD9 100%)",
      mb: "40px",
      py: "24px",
      "@media (max-width: 1540px)": {
         m: "0px 16px 24px 16px",
      },
   },
   mobileRoot: {
      borderRadius: 0,
      mx: "0px !important",
   },
   divider: {
      my: 2,
      strokeWidth: "1px",
      borderColor: (theme) => theme.brand.white[50],
      opacity: 0.41,
   },
   exploreMore: {
      color: (theme) => theme.brand.white[100],
      fontWeight: 400,
   },
   exploreChevron: {
      color: (theme) => theme.brand.white[50],
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
})

const carouselEmblaOptions: EmblaOptionsType = {
   dragFree: true,
   slidesToScroll: 2,
}

export const FeaturedCompanies = () => {
   return (
      <SuspenseWithBoundary>
         <FeaturedCompaniesView />
      </SuspenseWithBoundary>
   )
}

export const FeaturedCompaniesView = () => {
   const { userData } = useAuth()
   const { contentPlacementV1 } = useFeatureFlags()
   const { userCountryCode } = useUserCountryCode()

   const countryCode = userData?.countryIsoCode || userCountryCode

   // Possibly return null if user also does not have a field of study
   // Checking field of study, as the copy of the header is based on the field of study
   if (!contentPlacementV1 || !countryCode?.length) return null

   return (
      <FeaturedCompaniesComponent
         fieldOfStudyId={userData?.fieldOfStudy?.id}
         countryCode={countryCode}
      />
   )
}

type Props = {
   fieldOfStudyId?: string
   countryCode?: string
}

const FeaturedCompaniesComponent = ({ fieldOfStudyId, countryCode }: Props) => {
   const isMobile = useIsMobile()

   const { data: featuredCompanies } = useFeaturedGroupsSWR(countryCode)

   const [emblaRef, emblaApi] = useEmblaCarousel(carouselEmblaOptions, [
      WheelGesturesPlugin(),
   ])

   const onClickPrev = () => {
      emblaApi?.scrollPrev()
   }
   const onClickNext = () => {
      emblaApi?.scrollNext()
   }

   if (!featuredCompanies?.length) return null

   return (
      <Box sx={[styles.root, isMobile ? styles.mobileRoot : null]}>
         <Stack spacing={2}>
            <FeaturedCompaniesHeader
               category={
                  fieldOfStudyId
                     ? FieldOfStudyCategoryMap[fieldOfStudyId]
                     : null
               }
               onPreviousClick={onClickPrev}
               onNextClick={onClickNext}
            />
            {isMobile ? (
               <MobileFeaturedCompaniesCarousel companies={featuredCompanies} />
            ) : (
               <FeaturedCompaniesCarousel
                  companies={featuredCompanies}
                  emblaRef={emblaRef}
               />
            )}
         </Stack>
         {isMobile ? (
            <Box sx={{ px: { xs: 2, sm: 2, md: 0 } }}>
               <Divider sx={styles.divider} />
               <Link
                  href={`/companies?featured=true&category=${
                     fieldOfStudyId
                        ? FieldOfStudyCategoryMap[fieldOfStudyId]
                        : ""
                  }`}
                  target="_blank"
               >
                  <Stack direction="row" spacing={0.5}>
                     <Typography variant="small" sx={styles.exploreMore}>
                        Explore more companies
                     </Typography>
                     <Box sx={styles.exploreChevron} component={ChevronRight} />
                  </Stack>
               </Link>
            </Box>
         ) : null}
      </Box>
   )
}
