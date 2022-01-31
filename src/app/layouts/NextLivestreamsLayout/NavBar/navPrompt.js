import PropTypes from "prop-types";
import {
   Card,
   CardActionArea,
   CardContent,
   CardHeader,
} from "@mui/material";
import Link from "../../../materialUI/NextNavLink";
import CardMedia from "@mui/material/CardMedia";
import { searchImage } from "../../../constants/images";
import React from "react";
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
   media: {
      display: "grid",
      placeItems: "center",
      "& img": {
         maxWidth: "60%",
      },
   },
   subheader: {
      whiteSpace: "pre-wrap",
   },
}));

const NavPrompt = ({ href, title, subheader, imageSrc }) => {
   const classes = useStyles();
   return (
      <Card elevation={0}>
         <CardActionArea
            style={{ textDecoration: "none" }}
            href={href}
            component={Link}
         >
            <CardHeader
               align="center"
               titleTypographyProps={{
                  gutterBottom: true,
               }}
               subheaderTypographyProps={{
                  className: classes.subheader,
               }}
               {...{ title, subheader }}
            />
            <CardContent>
               <CardMedia className={classes.media}>
                  <img alt="Find Groups" src={imageSrc} />
               </CardMedia>
            </CardContent>
         </CardActionArea>
      </Card>
   );
};

NavPrompt.propTypes = {
   href: PropTypes.string,
   subheader: PropTypes.string,
   title: PropTypes.string,
   imageSrc: PropTypes.string,
};

NavPrompt.defaultProps = {
   href: "/groups",
   subheader: "Click here to discover some groups",
   title: "New to CareerFairy?",
   imageSrc: searchImage,
};

export default NavPrompt;
