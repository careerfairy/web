import { Page, TalentGuideModule } from "data/hygraph/types"
import { useRouter } from "next/router"
import { Play } from "react-feather"
import { FloatingButton } from "./FloatingButton"

type Props = {
   nextModule: Page<TalentGuideModule>
}

export const NextLevelButton = ({ nextModule }: Props) => {
   const { push } = useRouter()

   return (
      <FloatingButton
         color="primary"
         variant="contained"
         startIcon={<Play />}
         onClick={() => {
            push(`/levels/${nextModule.slug}`)
         }}
      >
         Start next level
      </FloatingButton>
   )
}
