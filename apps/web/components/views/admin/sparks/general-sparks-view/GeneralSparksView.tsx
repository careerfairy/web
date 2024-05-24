import { Stack } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import SparksContainer from "../components/SparksContainer"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./header/HeaderActions"
import SparksProgressIndicator from "./header/SparksProgressIndicator"
import SparksPlanBanner from "./plans-banner/SparksPlanBanner"

const styles = sxStyles({
   creatorSparksCollectionContainer: {
      pr: "0 !important",
   },
})

const GeneralSparksView: FC = () => {
   const { group, groupPresenter } = useGroup()
   const planDays = groupPresenter.getPlanDaysLeft()
   const planExpired = groupPresenter.hasPlanExpired()

   return (
      <Stack pb={4} alignItems="center" spacing={4.125}>
         <SparksPlanBanner
            planDays={planDays}
            showDayOne={planDays < 1}
            showDaySeven={planDays > 0 && planDays <= 7}
         />
         <SparksContainer show={!planExpired && !group.publicSparks}>
            <SparksProgressIndicator />
         </SparksContainer>
         <SparksContainer>
            <HeaderActions />
         </SparksContainer>
         <SparksContainer sx={styles.creatorSparksCollectionContainer}>
            <CreatorSparksCollection />
         </SparksContainer>
      </Stack>
   )
}

export default GeneralSparksView
