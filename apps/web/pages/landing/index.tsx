import { GetStaticProps } from "next"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { Page } from "../../data/graphcms/Page"
import useServerModel from "../../components/custom-hook/useServerModel"
import { HygraphRemoteFieldOfStudyResponse } from "../../types/cmsTypes"
import CmsPageLayout from "../../layouts/CmsPageLayout"
import LandingPage from "../../components/cms/landing-page/LandingPage"

type Props = {
   serverPage: Page
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
}

const Landing = ({ serverPage, fieldsOfStudy }: Props) => {
   const page = useServerModel<Page>(serverPage, Page.createFromPlainObject)

   return (
      <CmsPageLayout page={page}>
         <LandingPage fieldsOfStudy={fieldsOfStudy} hero={page.hero} />
      </CmsPageLayout>
   )
}

export const getStaticProps: GetStaticProps = async ({
   preview = true,
   locale,
}) => {
   if (process.env.APP_ENV === "test") {
      return {
         notFound: true,
      }
   }
   const [page, fieldsOfStudy] = await Promise.all([
      marketingPageRepo.getPage({
         slug: "hook-landing-page",
         preview,
         locale,
      }),
      marketingPageRepo.getFieldsOfStudyWithMarketingPages(),
   ])

   if (!page) {
      return {
         notFound: true,
      }
   }
   return {
      props: {
         preview,
         serverPage: page.serializeToPlainObject(),
         fieldsOfStudy: fieldsOfStudy,
      },
      revalidate: 60,
   }
}

export default Landing
