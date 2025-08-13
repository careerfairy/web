import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { brandedLightTheme } from "materialUI"
import GuidesCard from "../GuidesCard"

// Mock the group context
const mockGroup = {
   id: "test-group-id",
   name: "Test Group",
}

// Mock useGroup hook
jest.mock("layouts/GroupDashboardLayout", () => ({
   ...jest.requireActual("layouts/GroupDashboardLayout"),
   useGroup: () => ({ group: mockGroup, stats: null }),
}))

// Mock useEmblaCarousel
jest.mock("embla-carousel-react", () => ({
   __esModule: true,
   default: () => [jest.fn(), { scrollTo: jest.fn() }],
}))

// Mock the ContentCarousel component
jest.mock("components/views/common/carousels/ContentCarousel", () => ({
   ContentCarousel: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="content-carousel">{children}</div>
   ),
}))

const renderWithProviders = (component: React.ReactElement) => {
   return render(
      <ThemeProvider theme={brandedLightTheme}>
         {component}
      </ThemeProvider>
   )
}

describe("GuidesCard", () => {
   it("renders with correct title", () => {
      renderWithProviders(<GuidesCard />)
      
      expect(screen.getByTestId("card-title")).toHaveTextContent("Guides")
   })

   it("renders all three guide cards", () => {
      renderWithProviders(<GuidesCard />)
      
      expect(screen.getByText("Host live streams that attract and engage top talent")).toBeInTheDocument()
      expect(screen.getByText("New Live stream management experience")).toBeInTheDocument()
      expect(screen.getByText("Promote your offline events")).toBeInTheDocument()
   })

   it("renders CTA buttons with correct text", () => {
      renderWithProviders(<GuidesCard />)
      
      expect(screen.getByText("Read the full guide")).toBeInTheDocument()
      expect(screen.getByText("Discover now")).toBeInTheDocument()
      expect(screen.getByText("Talk to us")).toBeInTheDocument()
   })

   it("has the correct card structure for test compatibility", () => {
      renderWithProviders(<GuidesCard />)
      
      // Ensure it has the same data-testid as other cards for test compatibility
      expect(screen.getByTestId("card-custom")).toBeInTheDocument()
      expect(screen.getByTestId("card-title")).toBeInTheDocument()
   })

   it("replaces groupId in URLs correctly", () => {
      renderWithProviders(<GuidesCard />)
      
      // The second card should have the groupId replaced in its URL
      const discoverButton = screen.getByText("Discover now")
      expect(discoverButton.closest("a")).toHaveAttribute(
         "href",
         expect.stringContaining("test-group-id")
      )
   })
})