import SEO from "../components/util/SEO"
import { FC } from "react"
import { PaperBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { MarketingLandingPage } from "../data/graphcms/MarketingLandingPage"

interface Props {
   page: MarketingLandingPage
   children: React.ReactNode
}
const CmsPageLayout: FC<Props> = ({ children, page }) => (
   <PaperBackground>
      {page?.seo && <SEO id={page?.id} {...page.seo} />}
      <>{children}</>
   </PaperBackground>
)
export default CmsPageLayout
