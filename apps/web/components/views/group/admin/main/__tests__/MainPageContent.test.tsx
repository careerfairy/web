import { render, screen } from "../../../../../../tests/test-utils"
import MainPageContent from "../index"

// Mock the group context
const mockGroup = {
   id: "test-group-id",
   name: "Test Group",
}

const mockStats = {
   generalStats: {
      numberOfRegistrations: 10,
      numberOfApplications: 5,
   },
}

// Mock all the hooks and components that the main page uses
jest.mock("layouts/GroupDashboardLayout", () => ({
   ...jest.requireActual("layouts/GroupDashboardLayout"),
   useGroup: () => ({ group: mockGroup, stats: mockStats }),
}))

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

// Mock the custom hooks used by child components
jest.mock("../analytics/AggregatedTalentPoolValue", () => ({
   __esModule: true,
   default: () => <div>Talent Pool Value</div>,
}))

jest.mock("../analytics/AverageRegistrationsValue", () => ({
   __esModule: true,
   default: () => <div>Average Registrations</div>,
}))

// Mock other admin components that might have complex dependencies
jest.mock("../next-livestream/NextLivestreamCard", () => ({
   NextLivestreamCard: () => <div data-testid="next-livestream-card">Next Livestream</div>,
}))

jest.mock("../analytics/AggregatedAnalytics", () => ({
   __esModule: true,
   default: () => <div data-testid="aggregated-analytics">Analytics</div>,
}))

jest.mock("../registration-sources/AggregatedRegistrationSourcesCard", () => ({
   AggregatedRegistrationSourcesCard: () => <div data-testid="registration-sources-card">Registration Sources</div>,
}))

// Mock the MainPageProvider
jest.mock("../MainPageProvider", () => ({
   MainPageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock the Link component
jest.mock("components/views/common/Link", () => ({
   __esModule: true,
   default: ({ children, href, ...props }: any) => (
      <a href={href} {...props}>
         {children}
      </a>
   ),
}))

// Mock CardCustom component
jest.mock("../common/CardCustom", () => ({
   __esModule: true,
   default: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <div data-testid="card-custom">
         <div data-testid="card-title">{title}</div>
         <div data-testid="card-value">{children}</div>
      </div>
   ),
}))

const renderWithProviders = (component: React.ReactElement) => {
   return render(component)
}

describe("MainPageContent", () => {
   it("renders without crashing", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should render the Guides card title to verify the component rendered
      expect(screen.getByText("Guides")).toBeInTheDocument()
   })

   it("renders the Guides card instead of Live Stream Feedback card", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have the new Guides card
      expect(screen.getByTestId("card-title")).toHaveTextContent("Guides")
      
      // Should NOT have the old Live Stream Feedback card
      expect(screen.queryByText("Live Stream Feedback")).not.toBeInTheDocument()
   })

   it("renders all expected admin components", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have all the mocked components
      expect(screen.getByTestId("next-livestream-card")).toBeInTheDocument()
      expect(screen.getByTestId("aggregated-analytics")).toBeInTheDocument()
      expect(screen.getByTestId("registration-sources-card")).toBeInTheDocument()
      expect(screen.getByTestId("card-custom")).toBeInTheDocument() // Guides card
   })

   it("has the correct title and structure", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have the Guides card with correct title
      expect(screen.getByText("Guides")).toBeInTheDocument()
      
      // Should have the guide content
      expect(screen.getByText("Host live streams that attract and engage top talent")).toBeInTheDocument()
   })
})