import { Box, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { MentorsCarouselBlockType } from "data/hygraph/types"
import { MentorCard } from "./MentorCard"

type Props = MentorsCarouselBlockType

export const MentorsCarouselBlock = ({ title, subHeader }: Props) => {
   return (
      <SuspenseWithBoundary fallback={"Loading..."}>
         <Stack gap="12px">
            <Stack gap="4px">
               <Typography
                  variant="brandedH4"
                  sx={{
                     fontWeight: "700",
                     color: "#3D3D47",
                  }}
               >
                  {title}
               </Typography>
               <Typography
                  variant="brandedBody"
                  sx={{
                     fontWeight: "400",
                     color: "#3D3D47",
                  }}
               >
                  {subHeader}
               </Typography>
            </Stack>
            <MentorsCarousel />
         </Stack>
      </SuspenseWithBoundary>
   )
}

const MentorsCarousel = () => {
   const { data: creators } = useGroupCreators("i8NjOiRu85ohJWDuFPwo")

   return (
      <Box sx={{ padding: 3 }}>
         <ContentCarousel
            slideWidth={MentorCard.width}
            viewportSx={{
               // hack to ensure shadows are not cut off
               padding: "16px",
               margin: "-16px",
               width: "calc(100% + 16px)",
            }}
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
            {creators.map((creator, index) => (
               <Box key={`mentor-slide-box-${index}`}>
                  <MentorCard
                     bannerUrl={
                        "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-pages%2Fi8NjOiRu85ohJWDuFPwo%2Fbanners%2F6b0acd76-8742-4b47-994e-f70616c95cb1_1200x900?alt=media&token=3eef2fd6-b3e5-4933-a65f-2242bf6f8dc6"
                     }
                     avatarUrl={creator.avatarUrl}
                     name={creator.firstName + " " + creator.lastName}
                     position={creator.position}
                     companyName={"CareerFairy"}
                     companyLogoUrl={
                        "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/groups%2Fi8NjOiRu85ohJWDuFPwo%2Flogos%2F18154762-db0e-4e03-900f-d79afbb4ec99.png?alt=media&token=39b9a078-7a22-457d-9f33-c469edcc3956"
                     }
                  />
               </Box>
            ))}
         </ContentCarousel>
      </Box>
   )
}
