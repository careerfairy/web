import React from "react";
import { Avatar, Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
const useStyles = makeStyles((theme) => {
   const cardBorderRadius = theme.spacing(3);
   return {
      root: {
         display: "flex",
         flexDirection: "column",
         width: "100%",
         justifyContent: "center",
         alignItems: "center",
         cursor: ({ isButton }) => isButton && "pointer",
         "&:hover": {
            "& .MuiAvatar-root": {
               boxShadow: theme.shadows[8],
            },
         },
         "& .MuiAvatar-root": {
            boxShadow: "none",
            width: theme.spacing(6),
            height: theme.spacing(6),
            transition: theme.transitions.create(["box-shadow"], {
               easing: theme.transitions.easing.easeInOut,
               duration: theme.transitions.duration.standard,
            }),
         },
      },
      groupLogo: {
         background: theme.palette.common.white,
         padding: theme.spacing(1),
         "& img": {
            objectFit: "contain",
         },
      },
      smallButton: {
         marginTop: theme.spacing(1),
         borderRadius: cardBorderRadius,
         padding: theme.spacing(0.5, 0),
      },
   };
});

const GroupLogoButton = ({ group, handleFollow }) => {
   const classes = useStyles();
   return (
      <div onClick={handleFollow} className={classes.root}>
         <Avatar
            className={clsx(classes.groupLogo, {
               isButton: Boolean(handleFollow),
            })}
            src={group.imgPath}
            alt={group.label}
         />
         {handleFollow && (
            <Button
               variant="outlined"
               size="small"
               fullWidth
               className={classes.smallButton}
               color="primary"
            >
               Follow
            </Button>
         )}
      </div>
   );
};

export default GroupLogoButton;
