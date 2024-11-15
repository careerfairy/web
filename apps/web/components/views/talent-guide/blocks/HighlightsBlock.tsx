import { Box } from "@mui/material"
import { HighlightsBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = HighlightsBlockType

export const HighlightsBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
