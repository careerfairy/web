import SEO from "../components/util/SEO"
import { HygraphResponseSeo } from "../types/cmsTypes"
import { FC } from "react"

interface Props {
   page: {
      id: string
      seo: HygraphResponseSeo
      title: string
      subtitle: string
   }
}
const CmsPageLayout: FC<Props> = ({ children, page }) => (
   <>
      {page?.seo && <SEO id={page?.id} {...page.seo} />}
      <>{children}</>
   </>
)
export default CmsPageLayout
