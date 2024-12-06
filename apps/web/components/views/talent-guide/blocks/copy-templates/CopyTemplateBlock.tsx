import { CopyTemplateBlockType } from "data/hygraph/types"
import { NetworkingReachOut } from "./NetworkingReachOut"

type Props = CopyTemplateBlockType

export const CopyTemplateBlock = ({ templateType }: Props) => {
   switch (templateType) {
      case "NetworkingReachOut":
         return <NetworkingReachOut />
      default:
         return <div>{templateType}</div>
   }
}
