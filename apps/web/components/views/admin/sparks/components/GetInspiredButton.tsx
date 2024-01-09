import { Button, ButtonProps } from "@mui/material"
import { sparksGetInspiredPdf } from "constants/files"
import { FC } from "react"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      textTransform: "none",
   },
})

const GetInspiredButton: FC<ButtonProps<"a">> = ({ sx, ...props }) => {
   return (
      <Button
         sx={combineStyles(styles.root, sx)}
         color="secondary"
         variant="outlined"
         component="a"
         download
         href={sparksGetInspiredPdf}
         target="_blank"
         {...props}
      >
         Get inspired
      </Button>
   )
}

export default GetInspiredButton
