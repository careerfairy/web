import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PublishConfirmation } from "../PublishConfirmation"

// Mock external dependencies
jest.mock("layouts/GroupDashboardLayout", () => ({
   useGroup: () => ({ group: { id: "test-group-id" } }),
}))

jest.mock("notistack", () => ({
   useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

jest.mock("../LivestreamCreationContext", () => ({
   useLivestreamCreationContext: () => ({ livestream: { id: "test-id" } }),
}))

jest.mock("../form/useLivestreamFormValues", () => ({
   useLivestreamFormValues: () => ({ isValid: true }),
}))

jest.mock("../form/usePublishLivestream", () => ({
   usePublishLivestream: () => ({
      isPublishing: false,
      publishLivestream: jest.fn().mockResolvedValue({}),
   }),
}))

jest.mock("../ShareLivestreamDialog", () => ({
   ShareLivestreamDialog: ({ livestreamId }: { livestreamId: string }) => (
      <div data-testid="share-dialog">Share Dialog for {livestreamId}</div>
   ),
}))

jest.mock("util/CommonUtil", () => ({
   errorLogAndNotify: jest.fn(),
}))

describe("PublishConfirmation", () => {
   const defaultProps = {
      handleCancelClick: jest.fn(),
   }

   it("renders the publish confirmation dialog initially", () => {
      render(<PublishConfirmation {...defaultProps} />)
      
      expect(screen.getByText("Ready to publish?")).toBeInTheDocument()
      expect(screen.getByText("Publish")).toBeInTheDocument()
   })

   it("shows share dialog after successful publish", async () => {
      const user = userEvent.setup()
      render(<PublishConfirmation {...defaultProps} />)
      
      const publishButton = screen.getByText("Publish")
      await user.click(publishButton)
      
      await waitFor(() => {
         expect(screen.getByTestId("share-dialog")).toBeInTheDocument()
         expect(screen.getByText("Share Dialog for test-id")).toBeInTheDocument()
      })
   })
})