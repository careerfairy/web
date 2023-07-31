import { Stack } from "@mui/material"
import useGroupCreators from "components/custom-hook/creator/useGroupCreators"
import { useGroup } from "layouts/GroupDashboardLayout"
import React from "react"
import CreatorSparks from "./CreatorSparks"
import { SuspenseWithBoundary } from "components/ErrorBoundary"

const CreatorSparksCollection = () => {
   return (
      <SuspenseWithBoundary fallback="Loading creators...">
         <Component />
      </SuspenseWithBoundary>
   )
}

const Component = () => {
   const { group } = useGroup()
   const { data: creators } = useGroupCreators(group.id)

   return (
      <Stack spacing={6}>
         {creators.map((creator) => (
            <CreatorSparks key={creator.id} creator={creator} />
         ))}
      </Stack>
   )
}

export default CreatorSparksCollection
