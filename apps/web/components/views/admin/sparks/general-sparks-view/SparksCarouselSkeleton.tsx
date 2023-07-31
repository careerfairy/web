import SparkCarouselCardSkeleton from "components/views/sparks/components/spark-card/SparkCarouselCardSkeleton"
import SparksCarousel from "./SparksCarousel"

type Props = {
   numSlides?: number
}

const SparksCarouselSkeleton = ({ numSlides = 3 }: Props) => {
   return (
      <SparksCarousel>
         {[...Array(numSlides)].map((_, index) => (
            <SparkCarouselCardSkeleton key={index} />
         ))}
      </SparksCarousel>
   )
}

export default SparksCarouselSkeleton
