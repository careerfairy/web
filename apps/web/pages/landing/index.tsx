import { GetStaticProps } from "next"
import marketingPageRepo from "../../data/graphcms/MarketingPageRepository"
import { Page } from "../../data/graphcms/Page"
import useServerModel from "../../components/custom-hook/useServerModel"
import SEO from "../../components/util/SEO"
import LandingPage from "../../components/cms/landing-page/LandingPage"
import GeneralLayout from "../../layouts/GeneralLayout"

type Props = {
   serverPage: Page
   fieldsOfStudy: []
}

const Landing = ({ serverPage, fieldsOfStudy }: Props) => {
   const page = useServerModel<Page>(serverPage, Page.createFromPlainObject)

   const { seo, id, title, subtitle, slug, image } = page

   return (
      <>
         <SEO id={id} {...seo} title={`${title} - CareerFairy Landing Page`} />
         <GeneralLayout backgroundColor={"#FFF"} hideNavOnScroll fullScreen>
            <LandingPage
               slug={slug}
               title={title}
               subTitle={subtitle}
               image={image}
               fieldsOfStudy={fieldsOfStudy}
            />
         </GeneralLayout>
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
      // TODO: getFieldsOfStudy()
      () => [{ id: "medic" }, { id: "professor" }],
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
