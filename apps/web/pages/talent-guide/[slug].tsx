import * as Sentry from "@sentry/nextjs"
import { useAppDispatch } from "components/custom-hook/store"
import SEO from "components/util/SEO"
import { AnimatedStepContent } from "components/views/talent-guide/animations/AnimatedStepContent"
import { StepActionButton } from "components/views/talent-guide/components/floating-buttons/StepActionButton"
import { Loader } from "components/views/talent-guide/components/Loader"
import { ModuleStepContentRenderer } from "components/views/talent-guide/components/ModuleStepContentRenderer"
import { PreviewModeAlert } from "components/views/talent-guide/components/PreviewModeAlert"
import { TalentGuideLayout } from "components/views/talent-guide/components/TalentGuideLayout"
import { TalentGuideProgress } from "components/views/talent-guide/components/TalentGuideProgress"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import { Fragment, useEffect } from "react"
import {
   loadTalentGuide,
   resetTalentGuide,
} from "store/reducers/talentGuideReducer"
import {
   useIsLoadingTalentGuide,
   useVisibleSteps,
} from "store/selectors/talentGuideSelectors"
import {
   tgBackendPreviewService,
   tgBackendService,
} from "../../data/hygraph/TalentGuideBackendService"

interface TalentGuidePageProps {
   // Define props here based on what you'll fetch from the service
   data: Page<TalentGuideModule>
}

const TalentGuidePage: NextPage<TalentGuidePageProps> = ({ data }) => {
   const dispatch = useAppDispatch()
   const { isPreview } = useRouter()
   const { authenticatedUser, isLoggedIn } = useAuth()
   const isLoadingGuide = useIsLoadingTalentGuide()

   useEffect(() => {
      if (!authenticatedUser.uid) {
         return
      }

      dispatch(
         loadTalentGuide({
            userAuthUid: authenticatedUser.uid,
            moduleData: data,
         })
      )

      return () => {
         dispatch(resetTalentGuide())
      }
   }, [dispatch, authenticatedUser.uid, data])

   const visibleSteps = useVisibleSteps()

   const isLoading = isLoadingGuide || !isLoggedIn

   return (
      <Fragment>
         {Boolean(isPreview) && <PreviewModeAlert />}
         <SEO title={`${data.content.moduleName} - CareerFairy Levels`} />
         {isLoading ? (
            <Loader />
         ) : (
            <TalentGuideLayout header={<TalentGuideProgress />}>
               <AnimatedStepContent>
                  {visibleSteps.map((step) => (
                     <ModuleStepContentRenderer key={step.id} step={step} />
                  ))}
               </AnimatedStepContent>
               <StepActionButton />
            </TalentGuideLayout>
         )}
      </Fragment>
   )
}

export const getStaticPaths: GetStaticPaths = async () => {
   const paths = []

   return { paths, fallback: "blocking" }
}

export const getStaticProps: GetStaticProps<TalentGuidePageProps> = async ({
   params,
   preview = false,
   locale,
}) => {
   if (process.env.APP_ENV === "test") {
      // no tests for talent guide yet
      return {
         notFound: true, // Return 404 in test environment
      }
   }

   const slug = params?.slug as string
   const service = preview ? tgBackendPreviewService : tgBackendService

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
