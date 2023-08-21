import { Box, Stack } from "@mui/material"
import { FC } from "react"
import Heading from "../common/Heading"
import SparksCarousel from "components/views/admin/sparks/general-sparks-view/SparksCarousel"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

type Props = {
   sparksContent: Spark[]
   handleSparksClicked: (spark: Spark) => Promise<boolean>
}

const PortalSparksContentCarousel: FC<Props> = ({
   sparksContent,
   handleSparksClicked,
}) => {
   return (
      <Box sx={{ px: 2 }}>
         <Stack direction={"column"} sx={{ gap: "10px" }}>
            <Heading sx={{ textTransform: "uppercase" }}>Sparks</Heading>
            <SparksCarousel
               sparks={sparksContent}
               onSparkClick={handleSparksClicked}
               isAdmin={false}
            />
         </Stack>
      </Box>
   )
}

export default PortalSparksContentCarousel
