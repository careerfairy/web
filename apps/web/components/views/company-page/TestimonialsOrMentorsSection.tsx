import { Box } from "@mui/material"
import useFeatureFlags from "components/custom-hook/useFeatureFlags"
import { useMountedState } from "react-use"
import { useCompanyPage } from "."
import { MentorsSection } from "./MentorsSection"
import TestimonialSection from "./TestimonialSection"

/**
 * This component is created to prevent client-side errors during development.
 * The company page uses refs for different sections to enable scrolling to the referenced component when a tab is clicked.
 * Since this page is also rendered server-side, we can't conditionally render components based on query parameter feature flags.
 * Doing so would break the Intersection Observer and cause client-side errors, resulting in a blank page.
 * By assigning the ref to a common component, we ensure the ref remains consistent, preventing errors.
 */
export const TestimonialsOrMentorsSection = () => {
   const { mentorsV1 } = useFeatureFlags()

   const { group, editMode, groupCreators } = useCompanyPage()
   const isMounted = useMountedState()

   if (
      !isMounted() ||
      (!group.testimonials?.length && !mentorsV1 && !editMode) ||
      (!groupCreators?.length && mentorsV1 && !editMode)
   )
      return null

   return (
      <Box sx={{ position: "relative" }}>
         {mentorsV1 ? <MentorsSection /> : <TestimonialSection />}
      </Box>
   )
}
