import React, { useMemo } from "react"
import AtsAccountIncomplete from "./AtsAccountIncomplete"
import useGroupATSAccounts from "components/custom-hook/useGroupATSAccounts"
import { useGroup } from "layouts/GroupDashboardLayout"
import ATSAccountContextProvider from "components/views/group/admin/ats-integration/ATSAccountContextProvider"
import AtsJobSelector from "./AtsJobSelector"
import JobList from "../components/JobList"
import SteppedDialog from "components/views/stepped-dialog/SteppedDialog"
import useIsMobile from "components/custom-hook/useIsMobile"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import {
   SlideUpTransition,
   SlideLeftTransition,
} from "components/views/common/transitions"
import ApplicationTestError from "./components/ApplicationTestError"
import ApplicationTestSuccess from "./components/ApplicationTestSuccess"
import AtsTestApplication from "./components/AtsTestApplication"
import { sxStyles } from "types/commonTypes"

const FIELD_ID = "jobs.jobs"

const styles = sxStyles({
   dialog: {
      top: { xs: "70px", md: 0 },
      borderRadius: 5,
   },
})

const views = [
   {
      key: "application-test",
      Component: AtsTestApplication,
   },
   {
      key: "application-success",
      Component: ApplicationTestSuccess,
   },
   {
      key: "application-error",
      Component: ApplicationTestError,
   },
]

const AtsJobForm = () => {
   const { group } = useGroup()
   const { data: accounts } = useGroupATSAccounts(group.id)
   const isMobile = useIsMobile()
   const [isOpen, handleOpen, handleClose] = useDialogStateHandler()

   const atsAccount = useMemo(() => accounts[0], [accounts])

   return (
      <ATSAccountContextProvider account={atsAccount}>
         <>
            {atsAccount?.isApplicationTestComplete() ? (
               <>
                  <AtsJobSelector fieldId={FIELD_ID} />

                  <JobList fieldId={FIELD_ID} />
               </>
            ) : (
               <AtsAccountIncomplete onDialogOpen={handleOpen} />
            )}

            <SteppedDialog
               key={isOpen ? "open" : "closed"}
               bgcolor="#FCFCFC"
               handleClose={handleClose}
               open={isOpen}
               views={views}
               transition={isMobile ? SlideUpTransition : SlideLeftTransition}
               sx={styles.dialog}
            />
         </>
      </ATSAccountContextProvider>
   )
}

export default AtsJobForm
