import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   root: {
      width: 80,
      height: 115,
      margin: "0 auto",
      "& .check-icon": {
         width: "80px",
         height: "80px",
         position: "relative",
         borderRadius: "50%",
         boxSizing: "content-box",
         border: `4px solid ${theme.palette.primary.main}`,
         "&::before": {
            top: "3px",
            left: "-2px",
            width: "30px",
            transformOrigin: "100% 50%",
            borderRadius: "100px 0 0 100px",
         },
         "&::after": {
            top: "0",
            left: "30px",
            width: "60px",
            transformOrigin: "0 50%",
            borderRadius: "0 100px 100px 0",
            animation: "$rotate-circle 4.25s ease-in",
         },
         "&::before, &::after": {
            content: "''",
            height: "100px",
            position: "absolute",
            background: "transparent",
            transform: "rotate(-45deg)",
         },
         "& .icon-line": {
            height: "5px",
            backgroundColor: theme.palette.primary.main,
            display: "block",
            borderRadius: "2px",
            position: "absolute",
            zIndex: 10,
            "&.line-tip": {
               top: "46px",
               left: "14px",
               width: "25px",
               transform: "rotate(45deg)",
               animation: "$icon-line-tip 0.75s",
            },
            "&.line-long": {
               top: "38px",
               right: "8px",
               width: "47px",
               transform: "rotate(-45deg)",
               animation: "$icon-line-long 0.75s",
            },
         },
         "& .icon-circle": {
            top: "-4px",
            left: "-4px",
            zIndex: 10,
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            position: "absolute",
            boxSizing: "content-box",
            border: `4px solid ${alpha(theme.palette.primary.main, 0.5)}`,
         },
         "& .icon-fix": {
            top: "8px",
            width: "5px",
            left: "26px",
            zIndex: 1,
            height: "85px",
            position: "absolute",
            transform: "rotate(-45deg)",
            backgroundColor: "transparent",
         },
      },
   },
   "@keyframes rotate-circle": {
      "0%": { transform: "rotate(-45deg)" },
      "5%": { transform: "rotate(-45deg)" },
      "12%": { transform: "rotate(-405deg)" },
      "100%": { transform: "rotate(-405deg)" },
   },
   "@keyframes icon-line-tip": {
      "0%": { width: "0", left: "1px", top: "19px" },
      "54%": { width: "0", left: "1px", top: "19px" },
      "70%": { width: "50px", left: "-8px", top: "37px" },
      "84%": { width: "17px", left: "21px", top: "48px" },
      "100%": { width: "25px", left: "14px", top: "45px" },
   },
   "@keyframes icon-line-long": {
      "0%": { width: "0", right: "46px", top: "54px" },
      "65%": { width: "0", right: "46px", top: "54px" },
      "84%": { width: "55px", right: "0px", top: "35px" },
      "100%": { width: "47px", right: "8px", top: "38px" },
   },
}));
const SuccessCheckmark = () => {
   const classes = useStyles();
   return (
      <Box width="100%" height={125}>
         <div className={classes.root}>
            <div className="check-icon">
               <span className="icon-line line-tip"></span>
               <span className="icon-line line-long"></span>
               <div className="icon-circle"></div>
               <div className="icon-fix"></div>
            </div>
         </div>
      </Box>
   );
};

export default SuccessCheckmark;
