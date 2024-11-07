import { Box } from "@mui/material"
import { FollowCompaniesBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = FollowCompaniesBlockType

export const FollowCompaniesBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
