import { Box, Typography } from "@mui/material"
import { ContentCarousel } from "components/views/mentor-page/ContentCarousel"
import { useMountedState } from "react-use"
import { useCompanyPage } from ".."
import { MentorCard } from "./MentorCard"

export const MentorsSection = () => {
   const { editMode, groupCreators } = useCompanyPage()

   const isMounted = useMountedState()

   if (!groupCreators?.length) return null

   if (!isMounted()) return null

   return (
      <Box>
         <ContentCarousel
            slideWidth={MentorCard.width}
            headerTitle={
               <Typography variant="h4" fontWeight={"600"} color="black" mb={1}>
                  Mentors
               </Typography>
            }
            viewportSx={{
               // hack to ensure shadows are not cut off
               padding: "16px",
               margin: "-16px",
               width: "calc(100% + 16px)",
            }}
         >
            {groupCreators.map((creator) => (
               <MentorCard
                  key={`mentor-slide-box-${creator.id}`}
                  creator={creator}
                  isEditMode={editMode}
               />
            ))}
         </ContentCarousel>
      </Box>
   )
}
