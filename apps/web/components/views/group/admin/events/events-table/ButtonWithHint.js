import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import clsx from "clsx"
import PropTypes from "prop-types"
import Button from "@mui/material/Button"
import HintIcon from "components/views/common/HintIcon"

const useButtonStyles = makeStyles((theme) => ({
   root: {
      whiteSpace: "nowrap",
   },
   btnLabel: {
      justifyContent: "space-between",
   },
}))

const ButtonWithHint = ({
   fullWidth = true,
   variant = "outlined",
   className,
   endIcon,
   hintTitle,
   hintDescription,
   color = "grey",
   ...props
}) => {
   const classes = useButtonStyles()
   return (
      <Button
         fullWidth={fullWidth}
         color={color}
         classes={{
            label: classes.btnLabel,
         }}
         variant={variant}
         endIcon={
            (hintTitle || hintDescription) && (
               <HintIcon title={hintTitle} description={hintDescription} />
            )
         }
         className={clsx(className, classes.root)}
         {...props}
      />
   )
}

ButtonWithHint.propTypes = {
   className: PropTypes.any,
}

export default ButtonWithHint
