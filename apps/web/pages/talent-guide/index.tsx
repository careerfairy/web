import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { GetStaticProps, NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import {
   tgPreviewService,
   tgService,
} from "../../data/hygraph/TalentGuideService"
interface TalentGuidePageProps {
   slugs: string[]
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ slugs }) => {
   const { isPreview, locale } = useRouter()
   return (
      <div>
         <h1>Talent Guide: {isPreview ? "Preview" : "Published"}</h1>
         <p>Locale: {locale}</p>
         <ul>
            {slugs.map((slug) => (
               <li key={slug}>
                  <Link locale={locale} href={`/talent-guide/${slug}`}>
                     {slug}
                  </Link>
               </li>
            ))}
         </ul>
         {Boolean(isPreview) && <PreviewModeAlert />}
      </div>
   )
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   preview = false,
}) => {
   const service = preview ? tgPreviewService : tgService

   const slugs = await service.getAllTalentGuideModulePageSlugs()

   return {
      props: {
         slugs,
      },
      revalidate: 60, // Revalidate every 60 seconds
   }
}

export default TalentGuidePage
