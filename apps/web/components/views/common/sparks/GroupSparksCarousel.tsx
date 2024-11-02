import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme } from "@mui/material"
import useSparks from "components/custom-hook/spark/useSparks"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { ReactNode } from "react"

type Props = {
   header: ReactNode
   handleSparksClicked: (spark: Spark) => void
   sx?: SxProps<Theme>
}

export const GroupSparksCarousel = ({
   sx,
   ...props
}: Props & { groupId: string }) => {
   const { data: groupSparks } = useSparks({
      totalItems: 8,
      groupId: props.groupId,
   })

   return <SparksCarousel sparks={groupSparks} containerSx={sx} {...props} />
}
