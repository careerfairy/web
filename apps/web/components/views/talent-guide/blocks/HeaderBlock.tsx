import { Box } from "@mui/material"
import { HeaderBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = HeaderBlockType

export const HeaderBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
