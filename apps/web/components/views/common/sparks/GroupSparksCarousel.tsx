import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
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
}

export const GroupSparksCarousel = ({
   sx,
   headerSx,
   ...props
}: Props & { groupId: string }) => {
   const { data: group } = useGroup(props.groupId)
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
            isMobile ? null : (
               <SeeAllLink
                  href={`/sparks/${groupSparks?.at(0)?.id}?interactionSource=${
                     InteractionSources.Company_Page
                  }&companyName=${group?.universityName}&groupId=${
                     props.groupId
                  }`}
               />
            )
         }
      />
   )
}
