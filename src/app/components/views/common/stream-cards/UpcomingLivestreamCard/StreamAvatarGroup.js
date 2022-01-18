import PropTypes from "prop-types";
import React from "react";
import { alpha } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import { AvatarGroup } from '@mui/material';
import { Avatar } from "@mui/material";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
   avatar: {
      background: theme.palette.common.white,
      border: `2px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
      width: theme.spacing(6),
      height: theme.spacing(6),
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
               imgProps={{ loading: "lazy" }}
               src={avatar.imgPath}
               alt={avatar.label}
               key={avatar.id}
            />
         ))}
      </AvatarGroup>
   ) : null;
};

StreamAvatarGroup.propTypes = {
   avatars: PropTypes.arrayOf(
      PropTypes.shape({
         imageUrl: PropTypes.string,
         alt: PropTypes.string,
      })
   ),
};

export default StreamAvatarGroup;
