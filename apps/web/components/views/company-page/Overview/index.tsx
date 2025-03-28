import { Stack } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import SparkPreviewDialog from "components/views/admin/sparks/general-sparks-view/SparkPreviewDialog"
import { useCompanyPage } from ".."
import AboutSection from "../AboutSection"
import EventSection from "../EventSection"
import JobsSection from "../JobsSection"
import { MentorsSection } from "../MentorsSection"
import SparksSection from "../SparksSection"
import { FollowCompany, SignUp } from "../ctas"

type Props = {
   editMode?: boolean
}

export const Overview = ({ editMode }: Props) => {
   const { isLoggedIn, isLoggedOut } = useAuth()
   const { group, customJobs } = useCompanyPage()

   const showFollowCompanyCta = isLoggedIn && !editMode
   const showSignUpCta = isLoggedOut && !editMode

   return (
      <Stack spacing={{ xs: 2, md: 3 }}>
         <AboutSection />
         {customJobs?.length ? <JobsSection /> : null}
         {group.publicSparks && group.hasSparks ? (
            <SparksSection key={group.id} groupId={group.id} />
         ) : null}
         {showSignUpCta ? <SignUp /> : null}
         {showFollowCompanyCta ? <FollowCompany /> : null}
         <MentorsSection />
         <EventSection />
         <SparkPreviewDialog />
      </Stack>
   )
}
