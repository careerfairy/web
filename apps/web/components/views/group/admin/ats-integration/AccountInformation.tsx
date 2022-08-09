import Box from "@mui/material/Box"
import { GroupATSAccount } from "@careerfairy/shared-lib/dist/groups/GroupATSAccount"
import SyncStatusButtonDialog from "./SyncStatusButtonDialog"
import RemoveLinkedAccountButton from "./RemoveLinkedAccountButton"
import { Grid } from "@mui/material"
import { useCallback, useState } from "react"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import SwipeableViews from "react-swipeable-views"
import { SwipeablePanel } from "../../../../../materialUI/GlobalPanels/GlobalPanels"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import { SkeletonStackMultiple } from "../../../../util/Skeletons"
import AccountJobs from "./AccountJobs"
import AccountApplications from "./AccountApplications"

type Props = {
   atsAccount: GroupATSAccount
}

const tabs = [
   {
      label: "Jobs",
      component: (atsAccount: GroupATSAccount) => (
         <AccountJobs atsAccount={atsAccount} />
      ),
   },
   {
      label: "Applications",
      component: (atsAccount: GroupATSAccount) => (
         <AccountApplications atsAccount={atsAccount} />
      ),
   },
]

const AccountInformation = ({ atsAccount }: Props) => {
   // Tabs behaviour
   const [activeTabIndex, setActiveTabIndex] = useState(0)
   const switchTabHandler = useCallback((...args) => {
      // clicking tabs handler
      setActiveTabIndex(args[1])
   }, [])

   return (
      <Grid container>
         <Grid item xs={6} pl={2}>
            <Tabs
               value={activeTabIndex}
               onChange={switchTabHandler}
               aria-label="ats content tabs"
            >
               {tabs.map((tab, i) => (
                  <Tab key={tab.label} label={tab.label} />
               ))}
            </Tabs>
         </Grid>
         <Grid item xs={6}>
            <Box
               display={"flex"}
               justifyContent={"end"}
               alignItems={"end"}
               mt={1}
               pr={3}
            >
               <Box mr={1}>
                  <SyncStatusButtonDialog
                     groupId={atsAccount.groupId}
                     integrationId={atsAccount.id}
                  />
               </Box>
               <RemoveLinkedAccountButton atsAccount={atsAccount} />
            </Box>
         </Grid>
         <Grid item xs={12}>
            <Box p={2}>
               <SwipeableViews
                  index={activeTabIndex}
                  onChangeIndex={switchTabHandler}
               >
                  {tabs.map((tab, i) => (
                     <SwipeablePanel
                        key={tab.label}
                        value={activeTabIndex}
                        index={i}
                     >
                        <SuspenseWithBoundary
                           fallback={
                              <SkeletonStackMultiple
                                 quantity={1}
                                 height={150}
                              />
                           }
                        >
                           {tab.component(atsAccount)}
                        </SuspenseWithBoundary>
                     </SwipeablePanel>
                  ))}
               </SwipeableViews>
            </Box>
         </Grid>
      </Grid>
   )
}

export default AccountInformation
