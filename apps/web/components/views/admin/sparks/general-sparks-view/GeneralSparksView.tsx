import { Stack } from "@mui/material"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import SparksContainer from "../components/SparksContainer"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./HeaderActions"

const styles = sxStyles({
   creatorSparksCollectionContainer: {
      pr: "0 !important",
   },
})

const GeneralSparksView: FC = () => {
   return (
      <Stack spacing={4.125}>
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
