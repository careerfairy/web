import Image from "next/image"

const BadgeIcon = ({ badgeKey, width = 20, height = 20, imageProps = {} }) => {
   return (
      <Image
         src={`/badges/${badgeKey}.svg`}
         width={width}
         height={height}
         alt={badgeKey}
         {...imageProps}
      />
   )
}

export default BadgeIcon
