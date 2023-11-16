import Image from "next/legacy/image"

const BadgeIcon = ({
   badgeKey,
   width = 20,
   height = 20,
   noBg = false,
   imageProps = {},
}) => {
   return (
      <Image
         src={`/badges/${badgeKey}${noBg ? "_nobg" : ""}.svg`}
         width={width}
         height={height}
         alt={badgeKey}
         {...imageProps}
      />
   )
}

export default BadgeIcon
