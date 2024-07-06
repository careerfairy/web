import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CircleIcon from "@mui/icons-material/Circle"
import { Box, Checkbox } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   cardSelectInput: {
      position: "absolute",
      top: 1,
      right: 1,
      zIndex: 99,
   },
   circle: {
      width: 24,
      height: 24,
   },
   selectedCircle: {
      borderRadius: "50%",
      background: "white",
   },
})

type Props = {
   id: string
   selected: boolean
   handleClick?: () => void
}

const icon = <CircleIcon sx={styles.circle} />
const checkedIcon = (
   <CheckCircleIcon sx={[styles.circle, styles.selectedCircle]} />
)

const CardTopCheckBox = ({ id, selected, handleClick }: Props) => {
   return (
      <Box sx={styles.cardSelectInput}>
         <Checkbox
            key={id}
            icon={icon}
            checkedIcon={checkedIcon}
            checked={selected}
            color={"secondary"}
            onClick={handleClick}
         />
      </Box>
   )
}

export default CardTopCheckBox
