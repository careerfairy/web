import { useRouter } from "next/router"
import { BottomBar, Layout, TopBar } from "./components"
import { MiddleContent } from "./components/MiddleContent"
import { StreamProvider } from "./context"
import { ToggleStreamModeButton } from "./components/ToggleStreamModeButton"

type Props = {
   isHost: boolean
}

export const StreamingPage = ({ isHost }: Props) => {
   const {
      query: { livestreamId },
   } = useRouter()

   return (
      <StreamProvider isHost={isHost} livestreamId={livestreamId as string}>
         <Layout>
            <TopBar />
            <MiddleContent />
            <BottomBar />
         </Layout>
         <ToggleStreamModeButton />
      </StreamProvider>
   )
}
