import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme } from "@mui/material"
import useSparks from "components/custom-hook/spark/useSparks"
import useIsMobile from "components/custom-hook/useIsMobile"
import { SeeAllLink } from "components/views/company-page/Overview/SeeAllLink"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import { ReactNode } from "react"

type Props = {
   header: ReactNode
   handleSparksClicked: (spark: Spark) => void
   sx?: SxProps<Theme>
   headerSx?: SxProps<Theme>
   seeAllHref?: string
   handleSeeAllClick?: () => void
}

export const GroupSparksCarousel = ({
   sx,
   headerSx,
   ...props
}: Props & { groupId: string }) => {
   const isMobile = useIsMobile()
   const { data: groupSparks } = useSparks({
      totalItems: 8,
      groupId: props.groupId,
   })

   return (
      <SparksCarousel
         sparks={groupSparks}
         containerSx={sx}
         {...props}
         headerSx={headerSx}
         seeAll={
            <SeeAllLink
               href={props.seeAllHref}
               onClick={props.handleSeeAllClick}
            />
         }
         disableArrows={isMobile}
      />
   )
}
