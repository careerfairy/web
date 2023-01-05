import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import React from "react"
import { alpha, useTheme } from "@mui/material/styles"
import makeStyles from "@mui/styles/makeStyles"
import { grey } from "@mui/material/colors"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import PropTypes from "prop-types"
import { validateHTMLColor } from "validate-color"

import {
   IconButton,
   Slide,
   Button,
   ButtonGroup,
   ClickAwayListener,
   Grow,
   Paper,
   Popper,
   MenuItem,
   MenuList,
   CircularProgress,
} from "@mui/material"

const useStyles = makeStyles((theme) => ({
   sendIcon: {
      background: "white",
      color: ({ disabled }) => (disabled ? "grey" : theme.palette.primary.main),
      borderRadius: "50%",
      fontSize: 15,
   },
   sendBtn: {
      width: 30,
      height: 30,
      background: alpha(theme.palette.primary.main, 0.5),
      "&$buttonDisabled": {
         color: grey[800],
      },
      "&:hover": {
         backgroundColor: theme.palette.primary.main,
      },
      margin: "0.5rem",
   },
   buttonDisabled: {},
   popper: {
      zIndex: 102,
   },
   dynamicButtonDisabled: {
      background: `${theme.palette.action.disabledBackground} !important`,
      color: `${theme.palette.action.disabled} !important`,
   },
   dynamicButtonRoot: {
      background: ({ color }) =>
         `linear-gradient(45deg, ${
            color || theme.palette.primary.main
         } 30%, ${alpha(color || theme.palette.primary.main, 0.8)} 90%)`,
      color: "white",
   },

   dynamicLabel: {
      textTransform: "capitalize",
   },
}))

export const PlayIconButton = ({
   addNewComment,
   disabled,
   IconProps = {},
   IconButtonProps = {},
   ...props
}) => {
   const classes = useStyles({ disabled })

   return (
      <div {...props}>
         <IconButton
            {...IconButtonProps}
            classes={{
               root: classes.sendBtn,
               disabled: classes.buttonDisabled,
            }}
            disabled={disabled}
            onClick={() => addNewComment()}
            size="large"
         >
            <ChevronRightRoundedIcon
               {...IconProps}
               className={classes.sendIcon}
            />
         </IconButton>
      </div>
   )
}
const DynamicColorButton = ({
   disabled,
   startIcon,
   loading,
   color,
   children,
   ...rest
}) => {
   const theme = useTheme()
   color =
      color === "secondary"
         ? theme.palette.secondary.main
         : color === "primary" || !validateHTMLColor(color)
         ? theme.palette.primary.main
         : color
   const classes = useStyles({ color })
   return (
      <Button
         {...rest}
         disabled={loading || disabled}
         startIcon={!loading && startIcon}
         classes={{
            root: classes.dynamicButtonRoot,
            label: classes.dynamicLabel,
            disabled: classes.dynamicButtonDisabled,
         }}
      >
         {loading ? <CircularProgress color="inherit" size={16} /> : children}
      </Button>
   )
}

DynamicColorButton.propTypes = {
   className: PropTypes.string,
   color: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.oneOf(["primary", "secondary"]),
   ]),
   startIcon: PropTypes.node,
   disabled: PropTypes.bool,
   loading: PropTypes.bool,
   size: PropTypes.oneOf(["small", "medium", "large"]),
}

//example
// const options = [{
//     label: 'Create a merge commit',
//     onClick: () => {
//     }
// }, {
//     label: 'Squash and merge',
//     onClick: () => {
//     }
// }, {
//     label: 'Rebase and merge',
//     onClick: () => {
//
//     }
// }];

const CustomSplitButton = ({
   options = [],
   mainButtonProps,
   slideDirection = "right",
   sideButtonProps,
   ...props
}) => {
   const classes = useStyles()
   const [open, setOpen] = React.useState(false)
   const anchorRef = React.useRef(null)
   const [selectedIndex, setSelectedIndex] = React.useState(0)

   const handleMenuItemClick = (event, index) => {
      setSelectedIndex(index)
      setOpen(false)
   }

   const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen)
   }

   const handleClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
         return
      }

      setOpen(false)
   }

   return (
      <>
         <Slide timeout={500} in direction={slideDirection}>
            <ButtonGroup
               {...props}
               variant="contained"
               color="primary"
               ref={anchorRef}
               aria-label="split button"
            >
               <Button
                  {...mainButtonProps}
                  onClick={options[selectedIndex].onClick}
               >
                  {options[selectedIndex].label}
               </Button>
               <Button
                  {...sideButtonProps}
                  color="primary"
                  aria-controls={open ? "split-button-menu" : undefined}
                  aria-expanded={open ? "true" : undefined}
                  aria-label="Select draft create strategy"
                  aria-haspopup="menu"
                  startIcon={<ArrowDropDownIcon />}
                  onClick={handleToggle}
               >
                  More options
               </Button>
            </ButtonGroup>
         </Slide>
         <Popper
            className={classes.popper}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
         >
            {({ TransitionProps, placement }) => (
               <Grow
                  {...TransitionProps}
                  style={{
                     transformOrigin:
                        placement === "bottom" ? "center top" : "center top",
                  }}
               >
                  <Paper>
                     <ClickAwayListener onClickAway={handleClose}>
                        <MenuList id="split-button-menu">
                           {options.map((option, index) => (
                              <MenuItem
                                 key={option.label}
                                 selected={index === selectedIndex}
                                 onClick={(event) => {
                                    handleMenuItemClick(event, index)
                                    option.onClick()
                                 }}
                              >
                                 {option.label}
                              </MenuItem>
                           ))}
                        </MenuList>
                     </ClickAwayListener>
                  </Paper>
               </Grow>
            )}
         </Popper>
      </>
   )
}

export { DynamicColorButton, CustomSplitButton }
