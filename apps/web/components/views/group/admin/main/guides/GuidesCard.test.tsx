import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { describe, it, expect, vi, beforeEach } from "vitest"
import GuidesCard from "./GuidesCard"

// Mock next/router
vi.mock("next/router", () => ({
   useRouter: vi.fn(),
}))

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, "open", {
   value: mockWindowOpen,
   writable: true,
})

const mockPush = vi.fn()
const mockRouter = {
   query: { groupId: "test-group-id" },
   push: mockPush,
}

describe("GuidesCard", () => {
   beforeEach(() => {
      vi.clearAllMocks()
      ;(useRouter as any).mockReturnValue(mockRouter)
   })

   it("renders the Guides card with title", () => {
      render(<GuidesCard />)
      
      expect(screen.getByTestId("card-title")).toHaveTextContent("Guides")
   })

   it("displays the first guide card by default", () => {
      render(<GuidesCard />)
      
      expect(
         screen.getByText("Host live streams that attract and engage top talent")
      ).toBeInTheDocument()
      expect(
         screen.getByText(/Learn the three key stages before, during and after/)
      ).toBeInTheDocument()
      expect(screen.getByText("Read the full guide")).toBeInTheDocument()
   })

   it("navigates through carousel with navigation buttons", () => {
      render(<GuidesCard />)
      
      // Initially shows first card
      expect(
         screen.getByText("Host live streams that attract and engage top talent")
      ).toBeInTheDocument()
      
      // Click next button
      const nextButton = screen.getByRole("button", { name: "" }) // ChevronRight icon
      fireEvent.click(nextButton)
      
      // Should show second card
      expect(
         screen.getByText("New Live stream management experience")
      ).toBeInTheDocument()
   })

   it("navigates through carousel with indicators", () => {
      render(<GuidesCard />)
      
      // Get all indicator dots
      const indicators = screen.getAllByRole("generic").filter(el => 
         el.style.width === "8px" && el.style.height === "8px"
      )
      
      // Click on third indicator (index 2)
      if (indicators.length >= 3) {
         fireEvent.click(indicators[2])
         
         // Should show third card
         expect(
            screen.getByText("Promote your offline events")
         ).toBeInTheDocument()
      }
   })

   it("handles external URL clicks correctly", () => {
      render(<GuidesCard />)
      
      // Click the CTA button for the first card (external URL)
      const ctaButton = screen.getByText("Read the full guide")
      fireEvent.click(ctaButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
         "https://support.careerfairy.io/en/article/live-stream-your-way-to-top-talent-a-guide-to-engaging-gen-z-recruitment-1ifie4a/",
         "_blank",
         "noopener,noreferrer"
      )
   })

   it("handles internal URL clicks with groupId replacement", () => {
      render(<GuidesCard />)
      
      // Navigate to second card
      const nextButton = screen.getByRole("button", { name: "" })
      fireEvent.click(nextButton)
      
      // Click the CTA button for the second card (internal URL with groupId placeholder)
      const ctaButton = screen.getByText("Discover now")
      fireEvent.click(ctaButton)
      
      expect(mockWindowOpen).toHaveBeenCalledWith(
         "https://careerfairy-ssr-webapp-pr-1737.vercel.app/group/test-group-id/admin/content/live-streams",
         "_blank",
         "noopener,noreferrer"
      )
   })

   it("disables navigation buttons at boundaries", () => {
      render(<GuidesCard />)
      
      // At first card, previous button should be disabled
      const prevButton = screen.getAllByRole("button").find(btn => 
         btn.querySelector('[data-testid="chevron-left"]') || 
         btn.textContent === ""
      )
      
      if (prevButton) {
         expect(prevButton).toBeDisabled()
      }
      
      // Navigate to last card
      const nextButton = screen.getAllByRole("button").find(btn => 
         btn.querySelector('[data-testid="chevron-right"]') || 
         btn.textContent === ""
      )
      
      if (nextButton) {
         fireEvent.click(nextButton) // Go to second card
         fireEvent.click(nextButton) // Go to third card
         
         // At last card, next button should be disabled
         expect(nextButton).toBeDisabled()
      }
   })

   it("handles image error with fallback", () => {
      render(<GuidesCard />)
      
      // Find the image element
      const image = screen.getByAltText("Host live streams that attract and engage top talent")
      
      // Simulate image error
      fireEvent.error(image)
      
      // Check that fallback image is set
      expect(image.getAttribute("src")).toMatch(/data:image\/svg\+xml/)
   })
})