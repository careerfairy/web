import { render, screen } from "@testing-library/react"
import { ShareLivestreamDialog } from "../ShareLivestreamDialog"

// Mock external dependencies
jest.mock("HOCs/AuthProvider", () => ({
   useAuth: () => ({ userData: { referralCode: "test123" } }),
}))

jest.mock("notistack", () => ({
   useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}))

jest.mock("react-use", () => ({
   useCopyToClipboard: () => [null, jest.fn()],
}))

jest.mock("util/makeUrls", () => ({
   makeLivestreamEventDetailsInviteUrl: () => "https://test-url.com",
}))

jest.mock("util/analyticsUtils", () => ({
   dataLayerEvent: jest.fn(),
}))

describe("ShareLivestreamDialog", () => {
   const defaultProps = {
      handleClose: jest.fn(),
      livestreamId: "test-livestream-id",
   }

   it("renders without crashing", () => {
      render(<ShareLivestreamDialog {...defaultProps} />)
      
      expect(screen.getByText("Share it with your audience!")).toBeInTheDocument()
      expect(screen.getByText("Use this link to share your stream with your talent community!")).toBeInTheDocument()
      expect(screen.getByText("Skip")).toBeInTheDocument()
      expect(screen.getByText("Copy")).toBeInTheDocument()
      expect(screen.getByText("LinkedIn")).toBeInTheDocument()
   })

   it("displays the livestream link in the text field", () => {
      render(<ShareLivestreamDialog {...defaultProps} />)
      
      expect(screen.getByDisplayValue("https://test-url.com")).toBeInTheDocument()
   })
})