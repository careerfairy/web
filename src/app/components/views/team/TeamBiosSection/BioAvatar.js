import PropTypes from "prop-types";
import { Avatar, Badge } from "@material-ui/core";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

export const SmallAvatar = withStyles((theme) => ({
   root: {
      bottom: 10,
      width: 35,
      height: 35,
      border: `2px solid ${theme.palette.background.paper}`,
      background: theme.palette.background.default,
      color: "#0072b1",
   },
}))(Avatar);

const BioAvatar = (props) => (
   <Badge
      overlap="circular"
      anchorOrigin={{
         vertical: "bottom",
         horizontal: "right",
      }}
      badgeContent={
         <SmallAvatar
            component="a"
            target="_blank"
            href={props.person.linkedinUrl}
            alt="linkedin"
         >
            <LinkedInIcon fontSize="default" />
         </SmallAvatar>
      }
   >
      <Avatar
         src={props.person.avatar}
         classes={{
            root: clsx(props.classes.avatar, {
               [props.classes.avatarHovered]: props.hovered,
            }),
         }}
         alt={props.person.name}
      />
   </Badge>
);

BioAvatar.propTypes = {
   classes: PropTypes.any,
   hovered: PropTypes.bool,
   person: PropTypes.shape({
      linkedinUrl: PropTypes.string,
      avatar: PropTypes.string,
      name: PropTypes.string,
   }),
};

export default BioAvatar;
