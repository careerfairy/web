import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Button, Tooltip, Typography } from "@mui/material"
import clsx from "clsx"

const useStyles = makeStyles((theme) => {
   return {
      tooltip: {
         backgroundColor: theme.palette.background.paper,
         color: theme.palette.text.primary,
         boxShadow: theme.shadows[1],
         fontSize: 11,
         padding: theme.spacing(2),
         [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(1.5),
            maxWidth: 150,
         },
      },
      arrow: {
         color: theme.palette.background.paper,
      },
      title: {
         fontWeight: 600,
         fontSize: "1rem",
      },
      text: {},
      buttonWrapper: {
         marginTop: theme.spacing(1),
         [theme.breakpoints.down("sm")]: {
            marginTop: theme.spacing(0.5),
         },
         width: "100%",
         display: "flex",
         justifyContent: "flex-end",
      },
      "@keyframes blink": {
         "50%": {
            borderColor: theme.palette.secondary.main,
         },
      },
      highlight: {
         borderRadius: 10,
         border: "5px solid transparent",
         animation: "$blink 0.7s linear infinite alternate",
      },
      whiteBackground: {
         backgroundColor: "white",
         zIndex: theme.zIndex.tooltip,
      },
   }
})
//
export const WhiteTooltip = ({
   title,
   children,
   open,
   backdropEnabled = false,
   style = {},
   ...props
}) => {
   const classes = useStyles()

   return (
      <Tooltip
         arrow
         open={open}
         {...props}
         classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
         title={title}
      >
         <div
            style={style}
            className={clsx({
               [classes.highlight]: open,
               [classes.whiteBackground]: backdropEnabled,
            })}
         >
            {children}
         </div>
      </Tooltip>
   )
}

export const StandartTooltip = ({ title, children, open, ...props }) => {
   const classes = useStyles()

   return (
      <Tooltip
         arrow
         open={open}
         {...props}
         classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
         title={title}
      >
         <div>{children}</div>
      </Tooltip>
   )
}

export const TooltipHighlight = ({ open, ...props }) => {
   const classes = useStyles()
   return <div {...props} className={open ? classes.highlight : {}}></div>
}

export const TooltipTitle = ({ children, ...props }) => {
   const classes = useStyles()
   return (
      <Typography gutterBottom className={classes.title} {...props}>
         {children}
      </Typography>
   )
}

export const TooltipText = ({ children, ...props }) => {
   const classes = useStyles()
   return (
      <Typography className={classes.text} {...props}>
         {children}
      </Typography>
   )
}

export const TooltipButtonComponent = ({
   onConfirm,
   buttonText = "Ok",
   ...props
}) => {
   const classes = useStyles()
   return (
      <div className={classes.buttonWrapper} {...props}>
         <Button
            color="primary"
            size="small"
            variant="contained"
            onClick={onConfirm}
         >
            {buttonText}
         </Button>
      </div>
   )
}

export const StyledTooltipWithButton = ({
   children,
   open = false,
   tooltipTitle = "",
   buttonDisabled = false,
   tooltipText = "",
   buttonText = "Ok",
   placement = "top",
   onConfirm = () => {},
   backdropEnabled = false,
   ...rest
}) => {
   return (
      <WhiteTooltip
         placement={placement}
         open={open}
         backdropEnabled={backdropEnabled}
         {...rest}
         title={
            <React.Fragment>
               <TooltipTitle>{tooltipTitle}</TooltipTitle>
               <TooltipText>{tooltipText}</TooltipText>
               <TooltipButtonComponent
                  disabled={buttonDisabled}
                  onConfirm={onConfirm}
                  buttonText={buttonText}
               />
            </React.Fragment>
         }
      >
         {children}
      </WhiteTooltip>
   )
}
