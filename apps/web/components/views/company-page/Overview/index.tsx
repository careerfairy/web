import { Stack } from "@mui/material"
import AboutSection from "../AboutSection"

export const Overview = () => {
   return (
      <Stack px={2} spacing={{ xs: 2, md: 5 }}>
         <AboutSection />
         {/* {showJobs ? <JobsSection /> : null}
            {group.publicSparks ? (
                <SparksSection key={group.id} groupId={group.id} />
            ) : null}
            {showFollowCompanyCta ? <FollowCompany /> : null}
            {showSignUpCta ? <SignUp /> : null}
            {isMobile && !editMode ? (
                <>
                    <EventSection />
                    <TestimonialsOrMentorsSection />
                </>
            ) : (
                <>
                    <TestimonialsOrMentorsSection />
                    <EventSection />
                </>
            )} */}
      </Stack>
   )
}
