import PropTypes from "prop-types";
import { Avatar, Badge } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import React from "react";
import withStyles from "@mui/styles/withStyles";

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

const BioAvatar = ({ styles, hovered, person }) => (
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
            href={person.linkedinUrl}
            alt="linkedin"
         >
            <LinkedInIcon fontSize="medium" />
         </SmallAvatar>
      }
   >
      <Avatar
         src={person.avatar}
         sx={[styles.avatar, hovered && styles.avatarHovered]}
         alt={person.name}
      />
   </Badge>
);

BioAvatar.propTypes = {
   styles: PropTypes.any,
   hovered: PropTypes.bool,
   person: PropTypes.shape({
      linkedinUrl: PropTypes.string,
      avatar: PropTypes.string,
      name: PropTypes.string,
   }),
};

export default BioAvatar;
