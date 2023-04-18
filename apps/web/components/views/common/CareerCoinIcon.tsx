import Image from "next/image"
import { ImageProps } from "next/dist/client/image"

type Props = {
   width?: number
   height?: number
   imageProps?: ImageProps
}

const CareerCoinIcon = ({ width = 22, height = 24, imageProps }: Props) => {
   return (
      <Image
         src={"/cf_coin.svg"}
         width={width}
         height={height}
         alt={"CareerFairy Coin"}
         {...imageProps}
      />
   )
}

export default CareerCoinIcon
