import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Stack } from "@mui/material"
import { FC } from "react"
import CreatorDetails from "./CreatorDetails"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCreatorSparks from "components/custom-hook/spark/useCreatorSparks"
import SparksCarousel from "./SparksCarousel"

type Props = {
   creator: Creator
}

const CreatorSparks: FC<Props> = ({ creator }) => {
   return (
      <SuspenseWithBoundary fallback="Loading creators...">
         <Component creator={creator} />
      </SuspenseWithBoundary>
   )
}

const Component: FC<Props> = ({ creator }) => {
   const { data: sparks } = useCreatorSparks(creator.id)

   if (!sparks.length) return null

   return (
      <Stack spacing={1.25}>
         <CreatorDetails creator={creator} />
         <SparksCarousel
            options={{
               align: "start",
            }}
            sparks={sparks}
         />
      </Stack>
   )
}

export default CreatorSparks
