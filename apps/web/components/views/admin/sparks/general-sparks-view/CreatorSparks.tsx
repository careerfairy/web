import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Stack } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useCreatorSparks from "components/custom-hook/spark/useCreatorSparks"
import { EmblaOptionsType } from "embla-carousel-react"
import { FC, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setSparkToPreview } from "store/reducers/adminSparksReducer"
import { sparksShowHiddenSparks } from "store/selectors/adminSparksSelectors"
import CreatorDetails from "./CreatorDetails"
import CreatorDetailsSkeleton from "./CreatorDetailsSkeleton"
import SparksCarousel from "./SparksCarousel"
import SparksCarouselSkeleton from "./SparksCarouselSkeleton"

type Props = {
   creator: Creator
}

const CreatorSparks: FC<Props> = ({ creator }) => {
   return (
      <SuspenseWithBoundary fallback={<ComponentSkeleton />}>
         <Component creator={creator} />
      </SuspenseWithBoundary>
   )
}

const Component: FC<Props> = ({ creator }) => {
   const showHiddenSparks = useSelector(sparksShowHiddenSparks)

   const { data: sparks } = useCreatorSparks(creator.id, showHiddenSparks)

   const dispatch = useDispatch()

   const handleSparkClick = useCallback(
      (spark: Spark) => {
         dispatch(setSparkToPreview(spark.id))
      },
      [dispatch]
   )

   if (!sparks.length) return null

   return (
      <Stack spacing={4}>
         <CreatorDetails creator={creator} />
         <SparksCarousel
            onSparkClick={handleSparkClick}
            options={options}
            sparks={sparks}
            isAdmin
         />
      </Stack>
   )
}

const ComponentSkeleton: FC = () => {
   return (
      <Stack spacing={4}>
         <CreatorDetailsSkeleton />
         <SparksCarouselSkeleton />
      </Stack>
   )
}

const options: EmblaOptionsType = {
   align: "start",
}

export default CreatorSparks
