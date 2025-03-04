import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Box, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useAppDispatch } from "components/custom-hook/store"
import useFollowedCreators from "components/custom-hook/user/useFollowedCreators"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { MentorsCarouselBlockType } from "data/hygraph/types"
import { ReactNode } from "react"
import { useInView } from "react-intersection-observer"
import {
   trackLevelsMentorClick,
   trackLevelsMentorView,
} from "store/reducers/talentGuideReducer"
import { sxStyles } from "types/commonTypes"
import { buildMentorPageLink } from "util/routes"
import { MentorCard } from "./MentorCard"

const styles = sxStyles({
   title: {
      fontWeight: "700",
      color: (theme) => theme.palette.neutral["800"],
   },
   subHeader: {
      fontWeight: "400",
      color: (theme) => theme.palette.neutral["800"],
   },
   carouselViewport: {
      // hack to ensure shadows are not cut off
      padding: "16px",
      margin: "-16px",
      width: "calc(100% + 16px)",
   },
})

const MentorsCarouselSkeleton = () => {
   return (
      <ContentCarousel
         slideWidth={MentorCard.width}
         viewportSx={styles.carouselViewport}
         emblaProps={{
            emblaOptions: {
               dragFree: true,
               skipSnaps: true,
               loop: false,
               axis: "x",
            },
         }}
         disableArrows
      >
         {Array(8)
            .fill(null)
            .map((_, i) => (
               <MentorCard.Skeleton key={i} />
            ))}
      </ContentCarousel>
   )
}

type Props = MentorsCarouselBlockType

export const MentorsCarouselBlock = ({ title, subHeader }: Props) => {
   return (
      <SuspenseWithBoundary fallback={<MentorsCarouselSkeleton />}>
         <Stack id="mentors-carousel-block" gap="12px">
            {(Boolean(title) || Boolean(subHeader)) && (
               <Stack id="mentors-carousel-block-header" gap="4px">
                  {Boolean(title) && (
                     <Typography variant="brandedH4" sx={styles.title}>
                        {title}
                     </Typography>
                  )}
                  {Boolean(subHeader) && (
                     <Typography variant="brandedBody" sx={styles.subHeader}>
                        {subHeader}
                     </Typography>
                  )}
               </Stack>
            )}
            <MentorsCarousel />
         </Stack>
      </SuspenseWithBoundary>
   )
}

const MentorsCarousel = () => {
   const followedCreators = useFollowedCreators()
   const dispatch = useAppDispatch()

   const handleMentorClick = (creator: Creator) => {
      dispatch(
         trackLevelsMentorClick({
            mentorId: creator.id,
            mentorName: creator.firstName + " " + creator.lastName,
            companyId: creator.groupId,
         })
      )
   }

   return (
      <Box id="mentors-carousel-block-content">
         <ContentCarousel
            slideWidth={MentorCard.width}
            viewportSx={styles.carouselViewport}
            emblaProps={{
               emblaOptions: {
                  dragFree: true,
                  skipSnaps: true,
                  loop: false,
                  axis: "x",
               },
            }}
            disableArrows
         >
            {followedCreators.map((creator, index) => (
               <MentorTrackerWrapper
                  key={`mentor-slide-box-${index}`}
                  creator={creator}
               >
                  <MentorCard
                     onClick={() => handleMentorClick(creator)}
                     bannerUrl={creator.companyBannerUrl}
                     avatarUrl={creator.avatarUrl}
                     name={creator.firstName + " " + creator.lastName}
                     position={creator.position}
                     companyName={creator.companyName}
                     companyLogoUrl={creator.companyLogoUrl}
                     mentorPageLink={buildMentorPageLink({
                        universityName: creator.companyName,
                        firstName: creator.firstName,
                        lastName: creator.lastName,
                        creatorId: creator.id,
                     })}
                  />
               </MentorTrackerWrapper>
            ))}
         </ContentCarousel>
      </Box>
   )
}

type MentorTrackerProps = {
   creator: Creator
   children: ReactNode
}
const MentorTrackerWrapper = ({ creator, children }: MentorTrackerProps) => {
   const dispatch = useAppDispatch()

   const [inViewRef] = useInView({
      onChange: (inView) => {
         if (inView) {
            dispatch(
               trackLevelsMentorView({
                  mentorId: creator.id,
                  mentorName: creator.firstName + " " + creator.lastName,
                  companyId: creator.groupId,
               })
            )
         }
      },
      threshold: 0.6,
      triggerOnce: true,
   })

   return <Box ref={inViewRef}>{children}</Box>
}
