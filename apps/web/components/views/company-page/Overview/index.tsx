import { Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { TabValue, useCompanyPage } from ".."
import AboutSection from "../AboutSection"
import EventSection from "../EventSection"
import JobsSection from "../JobsSection"
import { MentorsSection } from "../MentorsSection"
import SparksSection from "../SparksSection"
import { FollowCompany, SignUp } from "../ctas"

type Props = {
   showJobs?: boolean
   editMode?: boolean
}

export const Overview = ({ showJobs, editMode }: Props) => {
   const { isLoggedIn, isLoggedOut } = useAuth()
   const { group, setActiveTab } = useCompanyPage()

   const showFollowCompanyCta = isLoggedIn && !editMode
   const showSignUpCta = isLoggedOut && !editMode

   return (
      <Stack spacing={{ xs: 2, md: 3 }}>
         <AboutSection />
         {showJobs ? <JobsSection /> : null}
         {group.publicSparks && group.hasSparks ? (
            <SparksSection
               key={group.id}
               groupId={group.id}
               onSeeAllClick={() => {
                  setActiveTab(TabValue.sparks)
               }}
            />
         ) : null}
         {showSignUpCta ? <SignUp /> : null}
         {showFollowCompanyCta ? <FollowCompany /> : null}
         <MentorsSection />
         <EventSection />
      </Stack>
   )
}
