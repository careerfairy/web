type Props = {
   width?: number
   height?: number
   withoutBorder?: boolean
}

const careerCoinWithBorder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/ui-icons%2FCF%20Coins.svg?alt=media&token=191ad2af-96eb-4cea-94e7-93ad21617160"
const careerCoin =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/ui-icons%2FCF%20Coins%20border.svg?alt=media&token=efa26a24-cdfc-4f85-8387-c0cc72840a35"

const CareerCoinIcon = ({ width = 22, height = 24, withoutBorder }: Props) => {
   return (
      <img
         src={withoutBorder ? careerCoinWithBorder : careerCoin}
         width={width}
         height={height}
         alt={"CareerFairy Coin"}
      />
   )
}

export default CareerCoinIcon
