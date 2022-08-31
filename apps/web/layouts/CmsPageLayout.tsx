import SEO from "../components/util/SEO"
import { FC } from "react"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { MarketingLandingPage } from "../data/graphcms/MarketingLandingPage"

interface Props {
   page: MarketingLandingPage
}
const CmsPageLayout: FC<Props> = ({ children, page }) => (
   <PillsBackground>
      {page?.seo && <SEO id={page?.id} {...page.seo} />}
      <>{children}</>
   </PillsBackground>
)
export default CmsPageLayout
