import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Stack } from "@mui/material"
import Chip, { chipClasses } from "@mui/material/Chip"
import ImpressionsIcon from "components/views/common/icons/ImpressionsIcon"
import LikeIcon from "components/views/common/icons/LikeIcon"
import ShareIcon from "components/views/common/icons/ShareIcon"
import TotalPlaysIcon from "components/views/common/icons/TotalPlaysIcon"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { FC, ReactElement } from "react"
import { sxStyles } from "types/commonTypes"
import { numberToString } from "util/CommonUtil"

const styles = sxStyles({
   root: {},
   chip: {
      color: "white",
      background: "rgba(0, 0, 0, 0.20)",
      border: "1px solid #FFF",
      px: 1.5,
      py: 0.75,
      "& svg": {
         color: "inherit !important",
         ml: "0px !important",
         fontSize: 13,
      },
      [`& .${chipClasses.label}`]: {
         color: "inherit !important",
         fontSize: "0.85714rem",
         lineHeight: "117.5%",
         letterSpacing: "-0.00943rem",
         pr: 0,
      },
   },
})

type Props = {
   spark: Spark
}

const SparkStats: FC<Props> = ({ spark }) => {
   return (
      <Stack spacing={1.5}>
         <StatChip
            icon={<ImpressionsIcon />}
            value={spark.impressions}
            tooltip={`This Spark has been seen ${spark.impressions} times.`}
         />
         <StatChip
            icon={<TotalPlaysIcon />}
            value={spark.numberOfCareerPageClicks}
            tooltip={`Your Career Page has been viewed ${spark.numberOfCareerPageClicks} times from this Spark.`}
         />
         <StatChip
            icon={<LikeIcon />}
            value={spark.likes}
            tooltip={`This Spark has been liked ${spark.likes} times.`}
         />
         <StatChip
            icon={<ShareIcon />}
            value={spark.shareCTA}
            tooltip={`This Spark has been shared ${spark.shareCTA} times.`}
         />
      </Stack>
   )
}

type StatChipProps = {
   icon: ReactElement
   value: number
   tooltip?: string
}
const StatChip: FC<StatChipProps> = ({ icon, value, tooltip }) => {
   return (
      <span>
         <BrandedTooltip title={tooltip || ""}>
            <Chip sx={styles.chip} icon={icon} label={numberToString(value)} />
         </BrandedTooltip>
      </span>
   )
}

export default SparkStats
