import { StreamingPage } from "./StreamingPage"

/**
 * Viewer page functionality
 * /streaming/:id/viewer
 */
export class ViewerPage extends StreamingPage {
   public open(livestreamId: string) {
      return this.page.goto(`/streaming/viewer/${livestreamId}`, {
         waitUntil: "commit",
      })
   }
}
