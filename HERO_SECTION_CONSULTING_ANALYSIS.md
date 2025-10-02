# HeroSectionConsulting Design Analysis

## Overview
The HeroSectionConsulting was implemented as a variant of the panels page hero section, with specific styling and content tailored for the consulting industry. Based on the git history analysis, here's how it was designed:

## Design Structure

### 1. **Layout Architecture**
```typescript
<Stack> // Main hero container
  <Box> // Visual support container (decorative elements)
    <Box> // Left visual support
    <Box> // Right visual support (large screens only)
  </Box>
  <Stack> // Content stack
    <Stack> // Logo/title container
    <Stack> // Tag chips container
  </Stack>
  <Stack> // Panels/livestreams grid
</Stack>
```

### 2. **Color Scheme & Styling**
**Background:**
- Base: `#EDF4FA` (light blue)
- Complex gradient system with multiple layers:
  ```css
  background: linear-gradient(0deg, #EDF4FA 0%, #EDF4FA 100%), 
              linear-gradient(104deg, #F5FFF9 0%, #F5FFF9 100%), 
              linear-gradient(169deg, rgba(31, 219, 192, 0.13) 1.77%, rgba(42, 186, 165, 0.00) 98.23%), 
              linear-gradient(25deg, rgba(42, 186, 165, 0.00) -0.66%, rgba(31, 219, 192, 0.48) 141.07%), 
              #376B65
  ```

**Typography:**
- **Title**: "Consulting collection" in `#4A72C8` (blue)
- **Subtitle**: `neutral.800` color
- **Tag chips**: `#D7DCE1` background with `neutral.700` text

### 3. **Content Structure**

**Title & Branding:**
- Title: "Consulting collection" (Typography variant="h2")
- Subtitle: "Join live sessions with Europe's top consulting firms packed with career tips and real stories from young consultants"

**Tag Chips:**
- "Talk to real consultants"
- "Cases, tips & more" 
- "Live Interaction"

**Visual Elements:**
- Left visual support: `/panels/header-left-visual-support-consulting.svg`
- Right visual support: `/panels/header-right-visual-support-consulting.svg`

### 4. **Responsive Design**
```typescript
// Container dimensions
height: { xs: "812px", md: "431px" }
padding: { xs: 2, md: 4 }

// Visual support positioning
visualSupportLeft: {
  left: { xs: -78, md: -78 },
  top: -95,
  width: { xs: 174, md: 240 },
  height: { xs: 346, md: "auto" }
}

visualSupportRight: {
  right: { xs: -38, md: -30, lg: -24 },
  bottom: 0,
  width: { xs: 273, md: 220 },
  height: { xs: 346, md: "auto" }
}
```

### 5. **Dynamic Content Grid**
The hero section displays consulting livestreams in a responsive grid:
- **Mobile**: Single column (xs=12)
- **Tablet**: Two columns (sm=6) 
- **Desktop**: Three columns (md=4)
- **Maximum**: 6 livestreams in 2x3 grid layout

### 6. **Key Differences from Standard Panels Hero**

| Aspect | Panels Hero | Consulting Hero |
|--------|-------------|-----------------|
| **Background** | `#EDFAF8` (green) | `#EDF4FA` (blue) |
| **Title Color** | `#244D49` (dark green) | `#4A72C8` (blue) |
| **Title Text** | "Panels" | "Consulting collection" |
| **Tag Background** | `rgba(55, 107, 101, 0.22)` | `#D7DCE1` |
| **Visual Assets** | Green SVG files | Blue consulting SVG files |
| **Content Focus** | General panels | Consulting-specific livestreams |

### 7. **Advanced Features**

**Dynamic Spacing:**
- Uses ResizeObserver to measure hero and panels overlap
- Calculates dynamic bottom margin to prevent content collision
- Responsive to window resize and orientation changes

**Content Filtering:**
- Filters livestreams by `ManagementConsulting` industry
- Displays up to 6 consulting-specific events
- Removes moderators from speaker lists
- Excludes CareerFairy group from companies

### 8. **Technical Implementation Details**

**State Management:**
```typescript
const [dynamicBottomSpacing, setDynamicBottomSpacing] = useState<number>(32)
```

**Overlap Calculation:**
```typescript
const computeOverlap = () => {
  const heroRect = heroRef.current.getBoundingClientRect()
  const panelsRect = panelsRef.current.getBoundingClientRect()
  const extensionBelowHero = Math.max(0, panelsRect.bottom - heroRect.bottom)
  setDynamicBottomSpacing(extensionBelowHero + BASE_GAP_PX)
}
```

**Data Flow:**
- Server-side props fetch consulting livestreams
- Filters by `companyIndustries.includes("ManagementConsulting")`
- Serializes data for client-side rendering
- Handles livestream dialog interactions

## Design Philosophy

### 1. **Visual Hierarchy**
- Large, prominent title with industry-specific color
- Descriptive subtitle explaining value proposition
- Clear tag chips highlighting key benefits
- Grid layout showcasing actual content

### 2. **Industry Branding**
- Blue color scheme associated with consulting/corporate
- Professional, trustworthy aesthetic
- Consulting-specific copy and messaging
- Industry-relevant visual assets

### 3. **User Experience**
- Dynamic spacing prevents layout issues
- Responsive grid adapts to screen size
- Interactive cards with hover states
- Seamless dialog integration for event details

### 4. **Performance Considerations**
- Efficient ResizeObserver implementation
- Optimized image loading with priority
- Server-side filtering reduces client load
- Proper cleanup of event listeners

## Comparison with Our New Industry Pages

The consulting hero section follows a more **content-centric approach** compared to our new geometric design:

**Consulting Approach:**
- Rounded container with gradient background
- Decorative SVG elements for visual interest
- Content grid integrated within hero section
- Dynamic spacing calculations

**Our New Approach:**
- Full viewport geometric split design
- Bold color rectangles as primary visual elements
- Simplified content overlay
- Fixed positioning and layering

Both approaches are valid but serve different purposes:
- **Consulting**: Content showcase with subtle branding
- **New Industries**: Bold visual impact with clear differentiation