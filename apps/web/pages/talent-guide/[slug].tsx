import * as Sentry from "@sentry/nextjs"
import { ModuleStepContentRenderer } from "components/views/talent-guide/components/ModuleStepContentRenderer"
import { FORCE_GERMAN_LOCALE } from "data/hygraph/constants"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import Link from "next/link"
import {
   tgPreviewService,
   tgService,
} from "../../data/hygraph/TalentGuideService"

interface TalentGuidePageProps {
   // Define props here based on what you'll fetch from the service
   locale: string
   data: Page<TalentGuideModule>
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ locale, data }) => {
   return (
      <div>
         <Link href="/talent-guide">Back to Talent Guide</Link>
         {/* Implement your page content here using the props */}
         <h1>Talent Guide</h1>
         <p>Current locale: {locale}</p>
         {data.content.moduleSteps.map((step) => (
            <div key={step.id}>
               <h2>{step.stepTitle}</h2>
               <ModuleStepContentRenderer step={step} />
            </div>
         ))}
      </div>
   )
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
   let paths = []

   for (const locale of locales) {
      const slugs = await tgService.getAllTalentGuideModulePageSlugs()
      paths = [
         ...paths,
         ...slugs.map((slug) => ({
            params: { slug },
            locale,
         })),
      ]
   }

   // TODO: remove later
   paths = []

   return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   params,
   preview = false,
   locale,
}) => {
   const slug = params?.slug as string
   const service = preview ? tgPreviewService : tgService

   const forcedLocale = FORCE_GERMAN_LOCALE ? "de" : locale // TODO: remove when other languages for talent guide are available

   try {
      // Fetch data for the specific slug using the service
      const data = await service.getTalentGuideModulePageBySlug(
         slug,
         forcedLocale
      )

      return {
         props: {
            locale: forcedLocale,
            data,
         },
         revalidate: 60, // Revalidate every 60 seconds
      }
   } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
         extra: {
            slug,
            locale: forcedLocale,
            error: error instanceof Error ? error.message : String(error),
         },
      })

      return { notFound: true }
   }
}

export default TalentGuidePage
