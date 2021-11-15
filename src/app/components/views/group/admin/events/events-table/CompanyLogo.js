import React from "react";
import { Avatar, Box, Button } from "@material-ui/core";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions";
import ImageIcon from "@material-ui/icons/Image";
import EditIcon from "@material-ui/icons/Edit";

const useStyles = makeStyles((theme) => ({
   root: {
      width: "70%",
      height: "70%",
      maxHeight: 85,
      cursor: "pointer",
      boxShadow: theme.shadows[5],
      background: theme.palette.common.white,
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
      display: "flex",
      borderRadius: theme.spacing(0.5),
      borderBottomRightRadius: [theme.spacing(2.5), "!important"],
      borderTopLeftRadius: [theme.spacing(2.5), "!important"],
   },
   hoverOverLay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      color: theme.palette.common.white,
      backgroundColor: alpha(theme.palette.common.black, 0.4),
      opacity: 0,
      display: "flex",
      justifyContent: "center",
      "& svg": {
         position: "absolute",
         filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
      },
      alignItems: "center",
      zIndex: 1,
      transition: theme.transitions.create(["opacity"], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.short,
      }),
      "&:hover": {
         cursor: "pointer",
         opacity: 1,
      },
   },
}));

const CompanyLogo = ({
   onClick,
   livestream: { companyLogoUrl, backgroundImageUrl },
}) => {
   const classes = useStyles({ backgroundImageUrl });
   return (
      <Box
         display="flex"
         justifyContent="center"
         alignItems="center"
         position="relative"
         height="100%"
         width="100%"
         minWidth={160}
      >
         <div onClick={onClick} className={classes.hoverOverLay}>
            <EditIcon fontSize="large" color="inherit" />
         </div>
         <Avatar
            className={classes.root}
            variant="rounded"
            src={getResizedUrl(companyLogoUrl, "xs")}
         >
            {!backgroundImageUrl && (
               <Button size="large" startIcon={<ImageIcon />}>
                  Upload images
               </Button>
            )}
         </Avatar>
      </Box>
   );
};

export default CompanyLogo;
