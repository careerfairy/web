import { Stack } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import SparksContainer from "../components/SparksContainer"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./header/HeaderActions"
import SparksProgressIndicator from "./header/SparksProgressIndicator"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const styles = sxStyles({
   creatorSparksCollectionContainer: {
      pr: "0 !important",
   },
})

const GeneralSparksView: FC = () => {
   const { group } = useGroup()
   return (
      <Stack pb={4} alignItems="center" spacing={4.125}>
         {group.publicSparks ? null : (
            <SparksContainer>
               <SparksProgressIndicator />
            </SparksContainer>
         )}
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
