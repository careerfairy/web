import { Box } from "@mui/material"
import { SparksCarouselBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = SparksCarouselBlockType

export const SparksCarouselBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
