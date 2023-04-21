import Image from "next/image"
import { ImageProps } from "next/image"

type Props = {
   width?: number
   height?: number
   withoutBorder?: boolean
   imageProps?: ImageProps
}

const CareerCoinIcon = ({
   width = 22,
   height = 24,
   withoutBorder,
   imageProps,
}: Props) => {
   return (
      <Image
         src={withoutBorder ? "/cf_coin.svg" : "/cf_coin_with_border.svg"}
         width={width}
         height={height}
         alt={"CareerFairy Coin"}
         {...imageProps}
      />
   )
}

export default CareerCoinIcon
