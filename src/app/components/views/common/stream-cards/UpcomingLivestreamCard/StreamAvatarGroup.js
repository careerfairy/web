import PropTypes from "prop-types";
import React from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { AvatarGroup } from "@material-ui/lab";
import { Avatar } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   avatar: {
      background: theme.palette.background.paper,
      border: `2px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
      width: theme.spacing(6),
      height: theme.spacing(6),
      [theme.breakpoints.up("md")]: {
         width: theme.spacing(8),
         height: theme.spacing(8),
      },
   },
   logoAvatar: {
      "& img": {
         objectFit: "contain",
      },
   },
}));
const StreamAvatarGroup = ({ avatars, max = 2, isLogo }) => {
   const classes = useStyles();
   return avatars.length ? (
      <AvatarGroup max={max}>
         {avatars.map((avatar) => (
            <Avatar
               className={clsx(classes.avatar, {
                  [classes.logoAvatar]: isLogo,
               })}
               src={avatar.imageUrl}
               alt={avatar.alt}
            />
         ))}
      </AvatarGroup>
   ) : null;
};

StreamAvatarGroup.propTypes = {
   avatars: PropTypes.shape({
      imageUrl: PropTypes.string,
      alt: PropTypes.string,
   }),
};

export default StreamAvatarGroup;
