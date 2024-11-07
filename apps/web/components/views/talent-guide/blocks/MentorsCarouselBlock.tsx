import { Box } from "@mui/material"
import { MentorsCarouselBlockType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = MentorsCarouselBlockType

export const MentorsCarouselBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
