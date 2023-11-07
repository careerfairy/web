import { BottomBar, Layout, TopBar } from "./components"
import { MiddleContent } from "./components/MiddleContent"

export const StreamingPage = () => {
   return (
      <Layout>
         <TopBar />
         <MiddleContent />
         <BottomBar />
      </Layout>
   )
}
