import { Box } from "@mui/material"
import { LivestreamsCarouselBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = LivestreamsCarouselBlockType

export const LivestreamsCarouselBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
