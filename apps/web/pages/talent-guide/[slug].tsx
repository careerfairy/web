import * as Sentry from "@sentry/nextjs"
import { useAppDispatch } from "components/custom-hook/store"
import { AnimatedStepContent } from "components/views/talent-guide/animations/AnimatedStepContent"
import { StepActionButton } from "components/views/talent-guide/components/floating-buttons/StepActionButton"
import { ModuleStepContentRenderer } from "components/views/talent-guide/components/ModuleStepContentRenderer"
import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { TalentGuideLayout } from "components/views/talent-guide/components/TalentGuideLayout"
import { TalentGuideProgress } from "components/views/talent-guide/components/TalentGuideProgress"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import { useEffect } from "react"
import {
   resetTalentGuide,
   setModuleData,
} from "store/reducers/talentGuideReducer"
import { useVisibleSteps } from "store/selectors/talentGuideSelectors"
import {
   tgPreviewService,
   tgService,
} from "../../data/hygraph/TalentGuideService"

interface TalentGuidePageProps {
   // Define props here based on what you'll fetch from the service
   data: Page<TalentGuideModule>
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ data }) => {
   const dispatch = useAppDispatch()
   const { isPreview } = useRouter()

   useEffect(() => {
      dispatch(setModuleData(data))
   }, [dispatch, data])

   useEffect(() => {
      return () => {
         dispatch(resetTalentGuide())
      }
   }, [dispatch])

   const visibleSteps = useVisibleSteps()

   return (
      <TalentGuideLayout header={<TalentGuideProgress />}>
         <AnimatedStepContent>
            {visibleSteps.map((step) => (
               <ModuleStepContentRenderer key={step.id} step={step} />
            ))}
         </AnimatedStepContent>
         <StepActionButton />
         {Boolean(isPreview) && <PreviewModeAlert />}
      </TalentGuideLayout>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
   const paths = []

   // for (const locale of locales) {
   //    const slugs = await tgService.getAllTalentGuideModulePageSlugs()
   //    paths = [
   //       ...paths,
   //       ...slugs.map((slug) => ({
   //          params: { slug },
   //          locale,
   //       })),
   //    ]
   // }

   return { paths, fallback: "blocking" }
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   params,
   preview = false,
   locale,
}) => {
   const slug = params?.slug as string
   const service = preview ? tgPreviewService : tgService

   try {
      // Fetch data for the specific slug using the service
      const data = await service.getTalentGuideModulePageBySlug(slug, locale)

      return {
         props: {
            data,
         },
         revalidate: 60, // Revalidate every 60 seconds
      }
   } catch (error) {
      console.error(error)
      Sentry.captureException(error, {
         extra: {
            slug,
            error: error instanceof Error ? error.message : String(error),
         },
      })

      return { notFound: true }
   }
}

export default TalentGuidePage
