import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Tooltip, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => {
   return {
      tooltip: {
         backgroundColor: theme.palette.background.paper,
         color: theme.palette.text.primary,
         boxShadow: theme.shadows[1],
         fontSize: 11,
         padding: theme.spacing(2),
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
   };
});
//
export const WhiteTooltip = ({ title, children, open, style, ...props }) => {
   const classes = useStyles();

   return (
      <Tooltip
         arrow
         open={open}
         interactive
         {...props}
         classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
         title={title}
      >
         <div style={style} className={open ? classes.highlight : {}}>{children}</div>
      </Tooltip>
   );
};

export const StandartTooltip = ({ title, children, open, ...props }) => {
   const classes = useStyles();

   return (
      <Tooltip
         arrow
         open={open}
         interactive
         {...props}
         classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
         title={title}
      >
         <div>{children}</div>
      </Tooltip>
   );
};

export const TooltipHighlight = ({ open, ...props }) => {
   const classes = useStyles();
   return <div {...props} className={open ? classes.highlight : {}}></div>;
};

export const TooltipTitle = ({ children, ...props }) => {
   const classes = useStyles();
   return (
      <Typography gutterBottom className={classes.title} {...props}>
         {children}
      </Typography>
   );
};

export const TooltipText = ({ children, ...props }) => {
   const classes = useStyles();
   return (
      <Typography className={classes.text} {...props}>
         {children}
      </Typography>
   );
};

export const TooltipButtonComponent = ({
   onConfirm,
   buttonText = "Ok",
   ...props
}) => {
   const classes = useStyles();
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
   );
};

export const StyledTooltipWithButton = ({
   children,
   open = false,
   tooltipTitle = "",
   buttonDisabled = false,
   tooltipText = "",
   buttonText = "Ok",
   placement = "top",
   onConfirm = () => {},
   ...rest
}) => {
   return (
      <WhiteTooltip
         placement={placement}
         open={open}
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
   );
};
