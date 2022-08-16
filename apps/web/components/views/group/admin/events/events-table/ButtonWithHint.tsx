import React from "react"
import Button, { ButtonProps } from "@mui/material/Button"
import HintIcon from "components/views/common/HintIcon"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      whiteSpace: "nowrap",
      justifyContent: "space-between",
   },
})

interface Props extends ButtonProps {
   hintTitle?: string
   hintDescription?: string
}
const ButtonWithHint = ({
   fullWidth = true,
   variant = "outlined",
   hintTitle,
   hintDescription,
   color = "grey",
   ...props
}: Props) => {
   return (
      <Button
         fullWidth={fullWidth}
         color={color}
         sx={styles.root}
         variant={variant}
         endIcon={
            (hintTitle || hintDescription) && (
               <HintIcon title={hintTitle} description={hintDescription} />
            )
         }
         {...props}
      />
   )
}

export default ButtonWithHint
