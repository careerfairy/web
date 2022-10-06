import SEO from "../components/util/SEO"
import { FC } from "react"
import { PaperBackground } from "../materialUI/GlobalBackground/GlobalBackGround"
import { MarketingLandingPage } from "../data/hygraph/MarketingLandingPage"
import { Page } from "../data/hygraph/Page"

interface Props {
   page: MarketingLandingPage | Page
}
const CmsPageLayout: FC<Props> = ({ children, page }) => (
   <PaperBackground>
      {page?.seo && <SEO id={page?.id} {...page.seo} />}
      <>{children}</>
   </PaperBackground>
)
export default CmsPageLayout
