import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Stack } from "@mui/material"
import Chip, { chipClasses } from "@mui/material/Chip"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useSparkStats from "components/custom-hook/spark/useSparkStats"
import ImpressionsIcon from "components/views/common/icons/ImpressionsIcon"
import LikeIcon from "components/views/common/icons/LikeIcon"
import ShareIcon from "components/views/common/icons/ShareIcon"
import TotalPlaysIcon from "components/views/common/icons/TotalPlaysIcon"
import BrandedTooltip from "components/views/common/tooltips/BrandedTooltip"
import { FC, Fragment, ReactElement } from "react"
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
      <SuspenseWithBoundary fallback={<Fragment />}>
         <Component spark={spark} />
      </SuspenseWithBoundary>
   )
}

const Component: FC<Props> = ({ spark }) => {
   const { data: sparkStats } = useSparkStats(spark.id)

   const impressions = sparkStats?.impressions || 0
   const numberOfCareerPageClicks = sparkStats?.numberOfCareerPageClicks || 0
   const likes = sparkStats?.likes || 0
   const shareCTA = sparkStats?.shareCTA || 0

   return (
      <Stack spacing={1.5}>
         <StatChip
            icon={<ImpressionsIcon />}
            value={impressions}
            tooltip={`This Spark has been seen ${impressions} times.`}
         />
         <StatChip
            icon={<TotalPlaysIcon />}
            value={numberOfCareerPageClicks}
            tooltip={`Your Career Page has been viewed ${numberOfCareerPageClicks} times from this Spark.`}
         />
         <StatChip
            icon={<LikeIcon />}
            value={likes}
            tooltip={`This Spark has been liked ${likes} times.`}
         />
         <StatChip
            icon={<ShareIcon />}
            value={shareCTA}
            tooltip={`This Spark has been shared ${shareCTA} times.`}
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
