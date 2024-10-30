import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import { FC } from "react"
import SparksCarousel from "./SparksCarousel"

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
