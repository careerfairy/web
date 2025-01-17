import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme } from "@mui/material"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { useAuth } from "HOCs/AuthProvider"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { FallbackComponent } from "./FallbackComponent"

const styles = sxStyles({
   sparksCarousel: {
      mb: 4,
      ml: 2,
   },
})

type Props = {
   header: ReactNode
   handleSparksClicked: (spark: Spark) => void
   containerSx?: SxProps<Theme>
   headerSx?: SxProps<Theme>
}

export const UserSparksCarousel = ({
   header,
   containerSx,
   headerSx,
   ...props
}: Props) => {
   const { sparks, isLoading } = useUserSparks()
   const { isLoadingAuth } = useAuth()

   if (isLoadingAuth || isLoading)
      return <SparksLoadingFallback header={header} />

   return (
      <SparksCarousel
         {...props}
         header={header}
         sparks={sparks}
         containerSx={containerSx}
         headerSx={headerSx}
      />
   )
}

type SparksLoadingFallbackProps = {
   header?: ReactNode
}
const SparksLoadingFallback = ({ header }: SparksLoadingFallbackProps) => {
   return <FallbackComponent sx={styles.sparksCarousel} header={header} />
}
