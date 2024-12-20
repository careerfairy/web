import { HighlightsBlockType } from "data/hygraph/types"
import { HighlightsGrid } from "./HighlightsGrid"
import { HighlightsProvider } from "./control/HighlightsBlockContext"

type Props = HighlightsBlockType

export const HighlightsBlock = ({ highlights }: Props) => {
   return (
      <HighlightsProvider highlights={highlights}>
         <HighlightsGrid />
      </HighlightsProvider>
   )
}
