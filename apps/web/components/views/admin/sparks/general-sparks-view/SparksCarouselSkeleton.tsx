import SparkCardSkeleton from "components/views/sparks/components/spark-card/SparkCardSkeleton"
import { FC } from "react"
import SparksCarousel from "./SparksCarousel"

type Props = {
   numSlides?: number
}

const SparksCarouselSkeleton: FC<Props> = ({ numSlides = 3 }) => {
   return (
      <SparksCarousel>
         {[...Array(numSlides)].map((_, index) => (
            <SparkCardSkeleton key={index} type="carousel" />
         ))}
      </SparksCarousel>
   )
}

export default SparksCarouselSkeleton
