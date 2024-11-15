import { Box } from "@mui/material"
import { JobsBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = JobsBlockType

export const JobsBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
