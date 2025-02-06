import { HighlightsBlockType } from "data/hygraph/types"
import { BlockWithAuthorPromotion } from "../BlockWithAuthorPromotions"
import { HighlightsGrid } from "./HighlightsGrid"
import { HighlightsProvider } from "./control/HighlightsBlockContext"

type Props = HighlightsBlockType

export const HighlightsBlock = ({ highlights, promotionData }: Props) => {
   return (
      <BlockWithAuthorPromotion promotionData={promotionData}>
         <HighlightsProvider highlights={highlights}>
            <HighlightsGrid />
         </HighlightsProvider>
      </BlockWithAuthorPromotion>
   )
}
