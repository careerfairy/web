import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Stack } from "@mui/material"
import { FC } from "react"
import CreatorDetails from "./CreatorDetails"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCreatorSparks from "components/custom-hook/spark/useCreatorSparks"
import SparksCarousel from "./SparksCarousel"
import { EmblaOptionsType } from "embla-carousel-react"
import { useSelector } from "react-redux"
import { sparksShowHiddenSparks } from "store/selectors/adminSparksSelectors"

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
   const showHiddenSparks = useSelector(sparksShowHiddenSparks)

   const { data: sparks } = useCreatorSparks(creator.id, showHiddenSparks)

   if (!sparks.length) return null

   return (
      <Stack spacing={4}>
         <CreatorDetails creator={creator} />
         <SparksCarousel options={options} sparks={sparks} />
      </Stack>
   )
}

const options: EmblaOptionsType = {
   align: "start",
}

export default CreatorSparks
