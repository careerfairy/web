import PropTypes from "prop-types";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AvatarGroup } from "@material-ui/lab";
import { Avatar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
   avatar: {
      width: theme.spacing(6),
      height: theme.spacing(6),
   },
}));
const StreamAvatarGroup = ({ avatars, max = 2 }) => {
   const classes = useStyles();
   console.log("-> avatars", avatars);
   return avatars.length ? (
      <AvatarGroup max={max}>
         {avatars.map((avatar) => (
            <Avatar
               className={classes.avatar}
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
