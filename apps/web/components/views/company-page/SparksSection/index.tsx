import SparksCarouselWithSuspenseComponent from "components/views/portal/sparks/SparksCarouselWithSuspenseComponent"
import { FC } from "react"

type Props = {
   groupId: String
}

const SparksSection: FC<Props> = ({ groupId }) => {
   const handleSparksClicked = async () => {}
   return (
      <SparksCarouselWithSuspenseComponent
         groupId={groupId}
         handleSparksClicked={handleSparksClicked}
      />
   )
}

export default SparksSection
