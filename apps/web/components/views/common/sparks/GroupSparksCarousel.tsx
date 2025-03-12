import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { SxProps, Theme, Typography } from "@mui/material"
import useGroup from "components/custom-hook/group/useGroup"
import useSparks from "components/custom-hook/spark/useSparks"
import { SparksCarousel } from "components/views/sparks/components/SparksCarousel"
import Link from "next/link"
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

   const { data: groupSparks } = useSparks({
      totalItems: 8,
      groupId: props.groupId,
   })

   const SeeAll = (
      <Link
         href={`/sparks/${groupSparks?.at(0)?.id}?interactionSource=${
            InteractionSources.Company_Page
         }&companyName=${group?.universityName}&groupId=${props.groupId}`}
      >
         <Typography
            variant="xsmall"
            color="neutral.600"
            sx={{ textDecoration: "underline", fontWeight: 400 }}
         >
            See all
         </Typography>
      </Link>
   )

   return (
      <SparksCarousel
         sparks={groupSparks}
         containerSx={sx}
         {...props}
         headerSx={headerSx}
         seeAll={SeeAll}
      />
   )
}
