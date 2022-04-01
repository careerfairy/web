import { NextApiResponse } from "next"

export default async function handler(_, res: NextApiResponse) {
   res.clearPreviewData()

   res.writeHead(307, { Location: "/" })
   res.end()
}
