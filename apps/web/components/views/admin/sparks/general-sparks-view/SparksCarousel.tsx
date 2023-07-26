import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react"
import Box from "@mui/material/Box"
import { sxStyles } from "types/commonTypes"
import { FC } from "react"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import SparksCard from "components/views/sparks/components/SparksCard"

const slideSpacing = "21px"
const slideSize = "306px"

const styles = sxStyles({
   viewport: {
      overflow: "hidden",
   },
   container: {
      backfaceVisibility: "hidden",
      display: "flex",
      touchAction: "pan-y",
      marginLeft: `calc(${slideSpacing} * -1)`,
   },
   slide: {
      flex: `0 0 ${slideSize}`,
      minWidth: 0,
      paddingLeft: slideSpacing,
      position: "relative",
   },
})

type PropType = {
   options?: EmblaOptionsType
   sparks: Spark[]
}

const SparksCarousel: FC<PropType> = (props) => {
   const { options, sparks } = props
   const [emblaRef, emblaApi] = useEmblaCarousel(options)

   return (
      <Box sx={styles.viewport} ref={emblaRef}>
         <Box sx={styles.container}>
            {sparks.map((spark) => (
               <Box key={spark.id} sx={styles.slide}>
                  <SparksCard />
               </Box>
            ))}
         </Box>
      </Box>
   )
}

export default SparksCarousel
