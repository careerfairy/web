import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Button, Grid, Tab, Tabs, Tooltip } from "@mui/material"
import { useCallback, useState } from "react"
import SwipeableViews from "react-swipeable-views"
import {
   SwipeablePanel,
   swipeableTabA11yProps,
} from "../../../../../materialUI/GlobalPanels/GlobalPanels"
import { sxStyles } from "../../../../../types/commonTypes"
import { SuspenseWithBoundary } from "../../../../ErrorBoundary"
import useGroupATSAccounts from "../../../../custom-hook/useGroupATSAccounts"
import useGroupFromState from "../../../../custom-hook/useGroupFromState"
import { SkeletonStackMultiple } from "../../../../util/Skeletons"
import Header from "../Header"
import ATSAccountContextProvider from "./ATSAccountContextProvider"
import AccountInformation from "./AccountInformation"
import LinkAccountButton from "./LinkAccountButton"

const styles = sxStyles({
   indicator: {
      height: (theme) => theme.spacing(0.8),
      padding: (theme) => theme.spacing(0, 0.5),
   },
   tabs: {},
   tab: {
      fontWeight: 600,
   },
})

const AtsIntegrationContent = () => {
   // Fetch ATS Data (suspense)
   const { groupPresenter } = useGroupFromState()
   // will hydrate the groupPresenter presenter with the ATS Accounts
   useGroupATSAccounts(groupPresenter.id, groupPresenter)

   // Tabs behaviour
   const [activeTabIndex, setActiveTabIndex] = useState(0)
   const switchTabHandler = useCallback((...args) => {
      if (args.length >= 3) {
         // swipeable handler
         setActiveTabIndex(args[0])
      } else {
         // clicking tabs menu handler
         setActiveTabIndex(args[1])
      }
   }, [])

   return (
      <>
         <Header
            title={"Applicants Tracking System"}
            subtitle={"Manage your ATS integrations"}
            actionNode={
               <LinkAccountAction
                  enabled={groupPresenter.atsAllowLinkNewAccounts()}
               />
            }
         >
            {groupPresenter.atsAccounts.length > 0 && (
               <Tabs
                  sx={styles.tabs}
                  value={activeTabIndex}
                  TabIndicatorProps={{ sx: styles.indicator } as any}
                  onChange={switchTabHandler}
                  indicatorColor="primary"
                  textColor="primary"
                  aria-label="full width tabs example"
               >
                  {groupPresenter.atsAccounts.map((entry, i) => (
                     <Tab
                        key={`tab-${entry.id}`}
                        sx={styles.tab}
                        label={entry.name}
                        {...swipeableTabA11yProps(i)}
                     />
                  ))}
               </Tabs>
            )}
         </Header>
         <SwipeableViews
            index={activeTabIndex}
            onChangeIndex={switchTabHandler}
         >
            {groupPresenter.atsAccounts.map((entry, i) => (
               <SwipeablePanel
                  key={`panel-${entry.id}`}
                  value={activeTabIndex}
                  index={i}
               >
                  <SuspenseWithBoundary
                     fallback={
                        <SkeletonStackMultiple quantity={1} height={150} />
                     }
                  >
                     <ATSAccountContextProvider account={entry}>
                        <AccountInformation />
                     </ATSAccountContextProvider>
                  </SuspenseWithBoundary>
               </SwipeablePanel>
            ))}
         </SwipeableViews>
         {groupPresenter.atsAccounts.length === 0 && (
            <BlankPage groupPresenter={groupPresenter} />
         )}
      </>
   )
}

const BlankPage = ({ groupPresenter }: { groupPresenter: GroupPresenter }) => {
   return (
      <Grid mt={4} container direction="column" alignItems="center">
         <Grid item xs={12}>
            <h4>Link an account to see some data.</h4>
         </Grid>
         <Grid item xs={12}>
            <LinkAccountAction
               enabled={groupPresenter.atsAllowLinkNewAccounts()}
            />
         </Grid>
      </Grid>
   )
}

const LinkAccountAction = ({ enabled }: { enabled: boolean }) => {
   const buttonTitle = "Link Account"

   if (!enabled) {
      return (
         <Tooltip title={"You already linked the maximum number of accounts"}>
            <span>
               <Button disabled variant="contained">
                  {buttonTitle}
               </Button>
            </span>
         </Tooltip>
      )
   }

   return <LinkAccountButton title={buttonTitle} />
}

export default AtsIntegrationContent
