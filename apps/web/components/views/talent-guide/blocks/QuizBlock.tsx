import { Box } from "@mui/material"
import { QuizModelType } from "data/hygraph/types"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({ root: {} })

type Props = QuizModelType

export const QuizBlock = ({ __typename }: Props) => {
   return <Box sx={styles.root}>{__typename}</Box>
}
