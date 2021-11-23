import React, { useState } from "react";
import { Avatar, Button } from "@material-ui/core";
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
         "& .MuiAvatar-root": {
            boxShadow: ({ hovered }) => (hovered ? theme.shadows[8] : "none"),
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
      btn: {
         cursor: "pointer",
      },
   };
});

const GroupLogoButton = ({ group, handleFollow }) => {
   const [hovered, setHovered] = useState(false);
   const classes = useStyles({ hovered });
   return (
      <div
         onClick={handleFollow}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
         className={clsx(classes.root, {
            [classes.btn]: Boolean(handleFollow),
         })}
      >
         <Avatar
            className={classes.groupLogo}
            src={group.imgPath}
            alt={group.label}
         />
         {handleFollow && (
            <Button
               variant={hovered ? "contained" : "outlined"}
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
