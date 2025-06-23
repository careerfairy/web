import { type Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { useAuth } from "HOCs/AuthProvider"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { SparksLoadingFallback } from "./SparksLoadingFallback"

const styles = sxStyles({
   sparksCarousel: {
      mb: 4,
      ml: 2,
   },
   sparksCarouselHeader: {
      mr: 2,
   },
})

type Props = {
   header: ReactNode
   handleSparksClicked: (spark: Spark) => void
}

export const UserSparksCarousel = ({ header, ...props }: Props) => {
   const { sparks, isLoading } = useUserSparks()
   const { isLoadingAuth } = useAuth()

   if (isLoadingAuth || isLoading) return <SparksLoadingFallback />

   return (
      <SparksCarousel
         {...props}
         header={header}
         sparks={sparks}
         containerSx={styles.sparksCarousel}
         headerSx={styles.sparksCarouselHeader}
      />
   )
}
