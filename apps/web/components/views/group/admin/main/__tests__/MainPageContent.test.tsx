import { render, screen } from "@testing-library/react"
import { ThemeProvider } from "@mui/material/styles"
import { GroupProvider } from "layouts/GroupDashboardLayout"
import { theme } from "packages/config-mui"
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

// Mock the custom hooks used by child components
jest.mock("../analytics/AggregatedTalentPoolValue", () => ({
   __esModule: true,
   default: () => <div>Talent Pool Value</div>,
}))

jest.mock("../analytics/AverageRegistrationsValue", () => ({
   __esModule: true,
   default: () => <div>Average Registrations</div>,
}))

const renderWithProviders = (component: React.ReactElement) => {
   return render(
      <ThemeProvider theme={theme}>
         <GroupProvider value={{ group: mockGroup, stats: mockStats }}>
            {component}
         </GroupProvider>
      </ThemeProvider>
   )
}

describe("MainPageContent", () => {
   it("renders without crashing", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should render the main container
      expect(screen.getByRole("main")).toBeInTheDocument()
   })

   it("renders the Guides card instead of Live Stream Feedback card", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have the new Guides card
      expect(screen.getByTestId("card-title")).toHaveTextContent("Guides")
      
      // Should NOT have the old Live Stream Feedback card
      expect(screen.queryByText("Live Stream Feedback")).not.toBeInTheDocument()
   })

   it("renders all expected admin cards", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have multiple cards (analytics, guides, etc.)
      const cards = screen.getAllByTestId("card-custom")
      expect(cards.length).toBeGreaterThan(1)
      
      // Should have the Guides card
      expect(screen.getByText("Guides")).toBeInTheDocument()
   })

   it("maintains the same grid structure", () => {
      renderWithProviders(<MainPageContent />)
      
      // Should have the MUI Grid container
      const container = screen.getByRole("main")
      expect(container).toBeInTheDocument()
      
      // Should have multiple grid items
      const gridItems = container.querySelectorAll('[class*="MuiGrid-item"]')
      expect(gridItems.length).toBeGreaterThan(0)
   })
})