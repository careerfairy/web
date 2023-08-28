import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import Heading from "components/views/portal/common/Heading"
import SparksCarousel from "./SparksCarousel"
import { Stack } from "@mui/material"
import { FC } from "react"

type Props = {
   numSlides?: number
}

const SparksCarouselSkeleton: FC<Props> = ({ numSlides = 3 }) => {
   return (
      <SparksCarousel>
         {[...Array(numSlides)].map((_, index) => (
            <SparkCarouselCardSkeleton key={index} />
         ))}
      </SparksCarousel>
   )
}

export default SparksCarouselSkeleton
