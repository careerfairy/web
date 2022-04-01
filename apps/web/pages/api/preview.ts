import caseStudyRepo from "../../data/graphcms/CaseStudyRepository"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (
      req.query.secret !== process.env.GRAPHCMS_PREVIEW_SECRET ||
      !req.query.slug
   ) {
      return res.status(401).json({ message: "Invalid token" })
   }

   // Fetch the headless CMS to check if the provided `slug` exists
   const { companyCaseStudy } =
      await caseStudyRepo.getCaseStudyAndMoreCaseStudies(
         req.query.slug as string,
         true
      )

   if (!companyCaseStudy) {
      return res
         .status(401)
         .json({ message: "Slug not found - cannot enter preview mode" })
   }
   // Enable Preview Mode by setting the cookies
   res.setPreviewData({})

   // Redirect to the path from the fetched case study
   // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
   res.writeHead(307, {
      Location: `/companies/customers/${companyCaseStudy.slug}`,
   })

   res.end()
}
