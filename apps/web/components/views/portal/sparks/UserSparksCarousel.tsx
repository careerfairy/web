import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme } from "@mui/material"
import { useUserSparks } from "components/custom-hook/spark/useUserSparks"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { useAuth } from "HOCs/AuthProvider"
import { ReactNode } from "react"
import { FallbackComponent } from "./FallbackComponent"

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
   const userSparks = useUserSparks()
   const { isLoadingAuth } = useAuth()

   if (isLoadingAuth)
      return <FallbackComponent header={header} sx={containerSx} />

   return (
      <SparksCarousel
         {...props}
         header={header}
         sparks={userSparks}
         containerSx={containerSx}
         headerSx={headerSx}
      />
   )
}
