import { GetStaticProps } from "next"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { Page } from "../../data/graphcms/Page"
import useServerModel from "../../components/custom-hook/useServerModel"
import SEO from "../../components/util/SEO"
import LandingPage from "../../components/cms/landing-page/LandingPage"
import { HygraphRemoteFieldOfStudyResponse } from "../../types/cmsTypes"

type Props = {
   serverPage: Page
   fieldsOfStudy: HygraphRemoteFieldOfStudyResponse[]
}

const Landing = ({ serverPage, fieldsOfStudy }: Props) => {
   const page = useServerModel<Page>(serverPage, Page.createFromPlainObject)

   const { seo, id, title, subtitle, slug, image } = page

   return (
      <>
         <SEO id={id} {...seo} title={`${title} - CareerFairy Landing Page`} />
         <LandingPage
            slug={slug}
            title={title}
            subTitle={subtitle}
            image={image}
            fieldsOfStudy={fieldsOfStudy}
         />
      </>
   )
}

export const getStaticProps: GetStaticProps = async ({
   params,
   preview = true,
   locale,
}) => {
   const [page, fieldsOfStudy] = await Promise.all([
      marketingPageRepo.getPage({
         slug: "myPage",
         preview: true,
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
