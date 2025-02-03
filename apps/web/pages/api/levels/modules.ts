import { tgBackendService } from "data/hygraph/TalentGuideBackendService"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
   req: NextApiRequest,
   res: NextApiResponse
) {
   if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" })
   }

   try {
      const locale = req.query.locale as string
      const modules = await tgBackendService.getAllTalentGuideModulePages(
         locale
      )

      return res.status(200).json(modules)
   } catch (error) {
      console.error("Error fetching modules:", error)
      return res.status(500).json({ error: "Internal server error" })
   }
}
