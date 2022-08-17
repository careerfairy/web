import SEO from "../components/util/SEO"
import { HygraphResponseSeo } from "../types/cmsTypes"
import { FC } from "react"
import { PillsBackground } from "../materialUI/GlobalBackground/GlobalBackGround"

interface Props {
   page: {
      id: string
      seo: HygraphResponseSeo
      title: string
      subtitle: string
   }
}
const CmsPageLayout: FC<Props> = ({ children, page }) => (
   <PillsBackground>
      {page?.seo && <SEO id={page?.id} {...page.seo} />}
      <>{children}</>
   </PillsBackground>
)
export default CmsPageLayout
