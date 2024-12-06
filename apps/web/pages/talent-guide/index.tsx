import { FORCE_GERMAN_LOCALE } from "data/hygraph/constants"
import { GetStaticProps, NextPage } from "next"
import Link from "next/link"
import {
   tgPreviewService,
   tgService,
} from "../../data/hygraph/TalentGuideService"
interface TalentGuidePageProps {
   slugs: string[]
   preview: boolean
   locale: string
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({
   slugs,
   preview,
   locale,
}) => {
   return (
      <div>
         <h1>Talent Guide: {preview ? "Preview" : "Published"}</h1>
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
      </div>
   )
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   locale,
   preview = false,
}) => {
   if (process.env.APP_ENV === "test") {
      // no tests for talent guide yet
      return {
         notFound: true, // Return 404 in test environment
      }
   }

   const service = preview ? tgPreviewService : tgService

   const slugs = await service.getAllTalentGuideModulePageSlugs()

   return {
      props: {
         slugs,
         locale: FORCE_GERMAN_LOCALE ? "de" : locale ?? null,
         preview,
      },
      revalidate: 60, // Revalidate every 60 seconds
   }
}

export default TalentGuidePage
