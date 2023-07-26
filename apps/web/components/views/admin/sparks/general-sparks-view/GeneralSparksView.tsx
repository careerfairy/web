import { Stack } from "@mui/material"
import { FC } from "react"
import CreatorSparksCollection from "./CreatorSparksCollection"
import HeaderActions from "./HeaderActions"
import OverflowWrapper from "./OverflowWrapper"

const GeneralSparksView: FC = () => {
   return (
      <Stack spacing={4.125}>
         <HeaderActions />
         <OverflowWrapper>
            <CreatorSparksCollection />
         </OverflowWrapper>
      </Stack>
   )
}

export default GeneralSparksView
