import { RichTextBlockType } from "data/hygraph/types"
import { RichTextRenderer } from "../components/RichTextRenderer"

type Props = RichTextBlockType

export const RichTextBlock = ({ content }: Props) => {
   return (
      <RichTextRenderer content={content.raw} references={content.references} />
   )
}
