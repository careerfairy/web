import PropTypes from "prop-types"
import React from "react"
import { alpha } from "@mui/material/styles"
import { Avatar, AvatarGroup } from "@mui/material"

const styles = {
   avatar: {
      background: (theme) => theme.palette.common.white,
      border: (theme) =>
         `2px solid ${alpha(theme.palette.text.secondary, 0.2)}`,
      width: (theme) => theme.spacing(6),
      height: (theme) => theme.spacing(6),
   },
   logoAvatar: {
      "& img": {
         objectFit: "contain",
      },
   },
}

const StreamAvatarGroup = ({ avatars, max = 2, isLogo }) => {
   return avatars.length ? (
      <AvatarGroup max={max}>
         {avatars.map((avatar) => (
            <Avatar
               sx={[styles.avatar, isLogo && styles.logoAvatar]}
               imgProps={{ loading: "lazy" }}
               src={avatar.imgPath}
               alt={avatar.label}
               key={avatar.id}
            />
         ))}
      </AvatarGroup>
   ) : null
}

StreamAvatarGroup.propTypes = {
   avatars: PropTypes.arrayOf(
      PropTypes.shape({
         imageUrl: PropTypes.string,
         alt: PropTypes.string,
      })
   ),
}

export default StreamAvatarGroup
