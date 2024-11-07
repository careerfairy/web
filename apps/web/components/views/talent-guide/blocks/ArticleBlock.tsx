import { Box } from "@mui/material"
import { ArticleBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = ArticleBlockType

export const ArticleBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
