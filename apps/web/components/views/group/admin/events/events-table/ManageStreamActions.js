import React, { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import SettingsIcon from "@mui/icons-material/Settings"
import makeStyles from "@mui/styles/makeStyles"
import clsx from "clsx"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import PropTypes from "prop-types"
import { Box, Collapse } from "@mui/material"
import ButtonWithHint from "./ButtonWithHint"

const useStyles = makeStyles((theme) => ({
   root: {
      // color: theme.palette.text.secondary,
   },
   btn: {
      whiteSpace: "nowrap",
   },
   icon: {
      transform: "rotate(0deg)",
      transition: theme.transitions.create("transform", {
         duration: theme.transitions.duration.shortest,
      }),
   },
   iconHovered: {
      transform: "rotate(180deg)",
   },
   streamActionButton: {
      marginTop: theme.spacing(0.5),
   },
   numberOfRegisteredBtn: {
      background: "transparent",
      marginBottom: theme.spacing(0.5),
      cursor: "default",
      "&:hover": {
         background: "transparent",
      },
   },
   btnLabel: {
      marginLeft: 10,
      textAlign: "left",
   },
   btnTitle: {
      lineHeight: "1rem",
      marginBottom: 5,
   },
   btnSubtitle: {
      fontWeight: 400,
      textTransform: "none",
      lineHeight: "1rem",
   },
}))
const ManageStreamActions = ({
   actions,
   isDraft,
   setTargetStream,
   rowData,
   numberOfRegisteredUsers,
   clicked,
}) => {
   const classes = useStyles()
   const [open, setOpen] = useState(false)

   useEffect(() => {
      if (clicked) {
         handleOpen()
      } else if (!clicked) {
         handleClose()
      }
   }, [clicked])

   const handleOpen = () => {
      setTargetStream(rowData)
      setOpen(true)
   }
   const handleClose = () => {
      // setTargetStream(null);
      setOpen(false)
   }

   const toggle = () => {
      if (open) handleClose()
      if (!open) handleOpen()
   }

   const showRegisteredUsersInfo = !open && !numberOfRegisteredUsers && !isDraft

   return (
      <Box display="flex" flexDirection="column" height="100%" minWidth={300}>
         {numberOfRegisteredUsers !== undefined && (
            <Button
               className={clsx(classes.btn, classes.numberOfRegisteredBtn)}
               disableElevation
               disableRipple
               variant="outlined"
               color="secondary"
               disableFocusRipple
               size="large"
            >
               {numberOfRegisteredUsers} - Registrations
            </Button>
         )}
         <Button
            className={clsx(classes.root, classes.btn)}
            fullWidth
            disableElevation
            variant="contained"
            color="grey"
            onClick={toggle}
            startIcon={<SettingsIcon />}
            endIcon={
               <ExpandMoreIcon
                  className={clsx(classes.icon, {
                     [classes.iconHovered]: open,
                  })}
               />
            }
         >
            <div className={showRegisteredUsersInfo ? classes.btnLabel : ""}>
               <div className={showRegisteredUsersInfo ? classes.btnTitle : ""}>
                  {open ? "Show Less" : "Manage stream"}
               </div>
               {showRegisteredUsersInfo && (
                  <div className={classes.btnSubtitle}>
                     Click to see registrations
                  </div>
               )}
            </div>
         </Button>
         <Collapse mountOnEnter in={open}>
            {actions
               .filter((action) => !action.hidden)
               .map((action) =>
                  action.loadedButton ? (
                     <React.Fragment key={action.tooltip}>
                        {action.loadedButton}
                     </React.Fragment>
                  ) : (
                     <ButtonWithHint
                        className={classes.streamActionButton}
                        hintTitle={action.hintTitle}
                        variant={action.variant}
                        color={action.color}
                        hintDescription={action.hintDescription}
                        startIcon={action.icon}
                        key={action.tooltip}
                        onClick={(e) => {
                           e.stopPropagation()
                           action.onClick()
                        }}
                        disabled={action.disabled}
                        fullWidth
                     >
                        {action.tooltip}
                     </ButtonWithHint>
                  )
               )}
         </Collapse>
      </Box>
   )
}

ManageStreamActions.propTypes = {
   actions: PropTypes.array,
}
export default ManageStreamActions
