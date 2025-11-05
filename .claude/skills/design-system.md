# Design System & UI Patterns

This skill provides explicit guidance on using CareerFairy's Material-UI design system with concrete code examples and strict dos/don'ts.

---

## 🚫 CRITICAL RULES - NO EXCEPTIONS

### NEVER DO THESE:

-  ❌ Hardcode hex colors: `#FFFFFF`, `#000`, `#2ABAA5`
-  ❌ Hardcode RGB/RGBA: `rgb(42, 186, 165)`, `rgba(0,0,0,0.5)`
-  ❌ Use brand colors with string notation: `"brand.white.100"`, `"brand.purple.300"`
-  ❌ Access brand colors via theme.palette: `theme.palette.brand.white[100]`
-  ❌ Custom fontSize/fontWeight: `fontSize: "16px"`, `fontWeight: 600`
-  ❌ Custom margin/padding: `margin: "8px"`, `padding: "16px"`
-  ❌ Use sx prop for typography: `sx={theme => theme.typography.brandedH3}`
-  ❌ Mix typography in Box: `<Box sx={theme => theme.typography.medium}>`
-  ❌ Inline sx for complex styling: `sx={{ color: "primary.main", p: 2, "&:hover": {...} }}`
-  ❌ Hardcode media queries: `@media (max-width: 768px)`
-  ❌ Create custom input components when branded ones exist
-  ❌ Use Material-UI icons when react-feather has the same icon

---

## ✅ DESIGN SYSTEM FILES REFERENCE

All theme values are defined here - ALWAYS reference these files:

-  **`packages/config-mui/palette.ts`** - Complete color palette definition
-  **`packages/config-mui/typography.ts`** - Typography variants and sizing
-  **`packages/config-mui/components.ts`** - Component styling and variants
-  **`packages/config-mui/breakpoints.ts`** - Custom breakpoints for responsive design

---

## 🎨 COLORS - Use Theme Palette Only

### Standard Palette Colors (String Notation Works)

```tsx
// ❌ WRONG - Hardcoded colors
sx={{ color: "#1F1F1F", backgroundColor: "#FEFEFE" }}
sx={{ borderColor: "rgba(0,0,0,0.12)" }}

// ✅ CORRECT - Theme palette colors
sx={{ color: "text.primary", backgroundColor: "background.paper" }}
sx={{ color: "neutral.700", backgroundColor: "primary.50" }}
sx={{ color: "primary.main", backgroundColor: "secondary.50" }}
sx={{ color: "common.black", backgroundColor: "grey.50" }}
sx={{ color: "gold.main", backgroundColor: "tertiary.main" }}

// ✅ CORRECT - Direct component color prop
<Typography color="neutral.700">Text</Typography>
<Typography color="text.secondary">Secondary text</Typography>
<Button color="primary">Click me</Button>
<Button sx={{ color: "gold.main" }}>Gold button</Button>
```

### Brand Colors (MUST Use Theme Function)

```tsx
// ❌ WRONG - String notation (WILL NOT WORK)
sx={{ backgroundColor: "brand.white.100" }}
sx={{ borderColor: "brand.purple.300" }}
sx={{ color: "brand.info.600" }}

// ❌ WRONG - Via theme.palette (WILL NOT WORK)
sx={{ backgroundColor: theme => theme.palette.brand.white[100] }}
sx={{ color: theme => theme.palette.brand.info[600] }}

// ✅ CORRECT - Brand colors MUST use theme function
sx={{ backgroundColor: theme => theme.brand.white[100] }}
sx={{ borderColor: theme => theme.brand.purple[300] }}
sx={{ color: theme => theme.brand.black[200] }}
sx={{ color: theme => theme.brand.info[600] }}
sx={{ backgroundColor: theme => theme.brand.success[50] }}
sx={{ borderColor: theme => theme.brand.error[300] }}
sx={{ color: theme => theme.brand.warning[600] }}

<Box sx={{ bgcolor: theme => theme.brand.white[100] }}>Content</Box>
```

### Color Palette Quick Reference

```tsx
// Text Colors
color: "text.primary" // #1F1F23 (main text)
color: "text.secondary" // #5C5C6A (lighter text)
color: "text.disabled" // #CACACA (disabled text)

// Background Colors
backgroundColor: "background.default" // #F5F5F5 (page)
backgroundColor: "background.paper" // #FFFFFF (cards)

// Primary & Secondary
color: "primary.main" // #2ABAA5 (teal)
color: "secondary.main" // #6749EA (purple)
color: "neutral.700" // #5C5C6A

// Legacy Colors
color: "tertiary.main" // #FAEDF2
color: "gold.main" // #FFC34F
color: "navyBlue.main" // #2C4251

// Brand Colors (theme function required)
backgroundColor: (theme) => theme.brand.white[100] // #FEFEFE
color: (theme) => theme.brand.info[600] // #3A70E2
backgroundColor: (theme) => theme.brand.success[50] // #E6FBED
```

---

## 📝 TYPOGRAPHY - Use Variant Prop Only

### Never Set Font Properties Directly

```tsx
// ❌ WRONG - Custom font properties
<Typography sx={{ fontSize: "24px", fontWeight: 600 }}>Title</Typography>
<Box sx={theme => theme.typography.medium}>Text</Box>

// ✅ CORRECT - Always use variant prop
<Typography variant="brandedH3">Title</Typography>
<Typography variant="medium">Body text</Typography>
<Typography variant="small">Small text</Typography>
```

### Typography Variants Reference

```tsx
// Branded Variants (Preferred - defined in typography.ts)
<Typography variant="brandedH1">Large Title</Typography>      // 28px→38px responsive
<Typography variant="brandedH2">Section Title</Typography>    // 24px→32px responsive
<Typography variant="brandedH3">Subsection</Typography>       // 20px→24px responsive
<Typography variant="brandedH4">Card Title</Typography>       // 18px→20px responsive
<Typography variant="brandedH5">Small Heading</Typography>    // 18px
<Typography variant="brandedBody">Body Text</Typography>      // 16px
<Typography variant="medium">Medium Text</Typography>         // 16px
<Typography variant="small">Small Text</Typography>           // 14px
<Typography variant="xsmall">Extra Small</Typography>         // 12px

// Standard MUI Variants (also available)
<Typography variant="h1">Heading 1</Typography>
<Typography variant="body1">Body text</Typography>
<Typography variant="caption">Caption</Typography>
```

### Combining Variant with Styling

```tsx
// ✅ CORRECT - Variant + color + spacing
<Typography variant="brandedH4" color="neutral.700">Subtitle</Typography>

<Typography
   variant="medium"
   color="text.secondary"
   sx={{ mb: 2, textAlign: "center" }}
>
   Styled text
</Typography>

// ❌ WRONG - Don't override font properties
<Typography variant="brandedH3" sx={{ fontSize: "20px" }}>Title</Typography>
```

---

## 📏 SPACING - Use Theme Values

### Theme Spacing Units (1 = 8px)

```tsx
// ❌ WRONG - Hardcoded spacing
sx={{ padding: "16px", margin: "8px" }}
sx={{ marginTop: "24px", paddingLeft: "12px" }}

// ✅ CORRECT - Shorthand (preferred)
sx={{ p: 2, m: 1 }}           // padding: 16px, margin: 8px
sx={{ px: 3, py: 1.5 }}        // horizontal: 24px, vertical: 12px
sx={{ mt: 2, mb: 3 }}          // margin-top: 16px, margin-bottom: 24px
sx={{ gap: 2 }}                // gap: 16px (for Stack/Grid)

// ✅ CORRECT - Theme function access
sx={{ padding: theme => theme.spacing(2) }}    // 16px
sx={{ margin: theme => theme.spacing(3) }}     // 24px
```

### Responsive Spacing

```tsx
// ✅ CORRECT - Different spacing per breakpoint
sx={{ p: { xs: 1, sm: 2, md: 3 } }}           // 8px → 16px → 24px
sx={{ gap: { xs: 1, md: 2 } }}                 // 8px → 16px
sx={{ mt: { xs: 2, tablet: 3, desktop: 4 } }} // Custom breakpoints
```

---

## 📱 RESPONSIVE DESIGN - Use Custom Breakpoints

### Never Hardcode Media Queries

```tsx
// ❌ WRONG - Hardcoded media queries
sx={{
   "@media (max-width: 768px)": { fontSize: "14px" },
   "@media (min-width: 1024px)": { display: "flex" }
}}

// ✅ CORRECT - Breakpoint objects (preferred)
sx={{
   width: { xs: "100%", tablet: "50%", desktop: "33%" },
   display: { xs: "block", tablet: "flex" },
   fontSize: { xs: "0.875rem", mobile: "1rem", desktop: "1.125rem" }
}}

// ✅ CORRECT - Theme breakpoints in media queries
sx={{
   [theme => theme.breakpoints.up('mobile')]: { fontSize: "1rem" },
   [theme => theme.breakpoints.down('tablet')]: { textAlign: "center" },
   [theme => theme.breakpoints.between('tablet', 'desktop')]: { p: 2 }
}}
```

### Custom Breakpoints Reference

From `packages/config-mui/breakpoints.ts`:

```tsx
// Standard MUI breakpoints
xs: 0       // Extra small (phones)
sm: 600     // Small (large phones)
md: 900     // Medium (tablets)
lg: 1280    // Large (desktops)
xl: 1920    // Extra large

// Custom CareerFairy breakpoints
mobile: 768            // Mobile devices
tablet: 1023           // Tablet devices
desktop: 1920          // Desktop devices
lsCardsGallery: 648    // Livestream cards gallery
sparksFullscreen: 989  // Sparks fullscreen mode

// Usage examples:
sx={{ width: { xs: "100%", mobile: "75%", tablet: "50%", desktop: "33%" } }}
sx={{ [theme => theme.breakpoints.up('lsCardsGallery')]: { gridColumns: 3 } }}
```

---

## 🎯 STYLING PATTERNS - Use sxStyles Helper

### Centralize Styles with sxStyles

**ALWAYS** use `sxStyles` helper for complex styling. Inline sx is only for minor adjustments.

```tsx
import { sxStyles, combineStyles } from "types/commonTypes"

// ❌ WRONG - Complex inline styles
<Box sx={{
   color: "text.primary",
   backgroundColor: "background.paper",
   p: 2,
   borderRadius: 1,
   "&:hover": { backgroundColor: "primary.light" },
   [theme => theme.breakpoints.up('mobile')]: { fontSize: "1.5rem" }
}}>
   Content
</Box>

// ✅ CORRECT - Centralized styles
const styles = sxStyles({
   container: {
      color: "text.primary",
      backgroundColor: "background.paper",
      p: 2,
      borderRadius: 1
   },
   header: {
      color: "primary.main",
      mb: 2,
      // Pseudo-selectors
      "&:hover": { backgroundColor: "primary.light" },
      "&:focus": { outline: "2px solid", outlineColor: "primary.main" },
      // Responsive with custom breakpoints
      fontSize: { xs: "1.2rem", tablet: "1.5rem", desktop: "1.8rem" },
      // Custom media queries
      [theme => theme.breakpoints.up('mobile')]: { textAlign: "left" }
   },
   brandedCard: {
      // Brand colors MUST use theme function
      backgroundColor: theme => theme.brand.white[100],
      borderColor: theme => theme.brand.purple[300],
      border: theme => `1px solid ${theme.brand.neutral[200] || '#e0e0e0'}`,
      p: 3,
      // Child selectors
      "& svg": { width: 20, height: 20, color: "neutral.600" },
      "& .MuiTypography-root": { color: "text.secondary" }
   }
})

// Usage in JSX
<Box sx={styles.container}>
   <Typography variant="brandedH3" sx={styles.header}>Title</Typography>
   <Box sx={styles.brandedCard}>Content</Box>
</Box>

// ✅ CORRECT - Minor adjustments only
<Typography variant="medium" sx={{ mb: 1, pt: 0.5 }}>Text</Typography>

// ✅ CORRECT - Combining styles
sx={combineStyles([styles.base, isActive && styles.active], customSx)}
sx={[styles.icon, isMobile && styles.iconMobile]}
```

---

## 🔘 BUTTONS - Use Theme Variants

```tsx
// ❌ WRONG - Custom button styling
<Button sx={{ backgroundColor: "#2ABAA5", color: "white", padding: "12px" }}>
   Click me
</Button>

// ✅ CORRECT - Theme variants and colors
<Button variant="contained" color="primary" size="medium">
   Primary Action
</Button>

<Button variant="outlined" color="secondary" size="small">
   Secondary Action
</Button>

<Button variant="text" color="grey">
   Tertiary Action
</Button>

// ✅ CORRECT - With Icons (react-feather)
import { Plus, ChevronDown } from "react-feather"

<Button startIcon={<Plus />} variant="contained" color="primary">
   Add Item
</Button>

<Button endIcon={<ChevronDown />} variant="outlined" color="grey">
   Dropdown
</Button>
```

### Button Variants & Colors

From `packages/config-mui/components.ts`:

**Variants**: `contained`, `outlined`, `text`
**Colors**: `primary`, `secondary`, `grey`, `black`, `navyBlue`, `gold`
**Sizes**: `small`, `medium`, `large`

---

## 🎨 ICONS - Use React Feather

```tsx
// ❌ WRONG - Material-UI icons when react-feather has it
import SearchIcon from "@mui/icons-material/Search"
<SearchIcon />

// ✅ CORRECT - React Feather
import { Search, ChevronDown, User, Settings } from "react-feather"

<Search size={20} />
<Search size={20} color={theme.palette.neutral[600]} />

// Common sizes:
<Search size={16} />  // Small
<Search size={20} />  // Medium (default)
<Search size={24} />  // Large
```

### Common React Feather Icons

```tsx
import {
   Search,
   ChevronDown,
   ChevronUp,
   ChevronLeft,
   ChevronRight,
   MoreVertical,
   X,
   Check,
   Plus,
   Minus,
   Edit,
   Trash2,
   User,
   Users,
   Settings,
   Mail,
   Phone,
   Calendar,
   Download,
   Upload,
   Filter,
   Star,
   Heart,
} from "react-feather"
```

---

## 🎛️ BRANDED COMPONENTS - Always Use When Available

### Input Components

```tsx
import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import BrandedAutocomplete from "components/views/common/inputs/BrandedAutocomplete"
import { BrandedCheckbox } from "components/views/common/inputs/BrandedCheckbox"
import BrandedRadio from "components/views/common/inputs/BrandedRadio"
import BrandedSwitch from "components/views/common/inputs/BrandedSwitch"
import BrandedSearchField from "components/views/common/inputs/BrandedSearchBar"

// ❌ WRONG - Creating custom TextField
<TextField label="Email" />

// ✅ CORRECT - Use branded component
<BrandedTextField
   label="Email"
   placeholder="Enter your email"
   fullWidth
/>

// ✅ CORRECT - Search input
<BrandedSearchField
   value={searchValue}
   onChange={setSearchValue}
   placeholder="Search items..."
/>

// ✅ CORRECT - Autocomplete/Select
<BrandedAutocomplete
   options={options}
   getOptionLabel={(option) => option.name}
   textFieldProps={{ label: "Select Option" }}
/>

// ✅ CORRECT - Checkbox
<BrandedCheckbox
   checked={isChecked}
   onChange={handleChange}
/>
```

### Form-Controlled Components (react-hook-form)

```tsx
import { ControlledBrandedTextField } from "components/views/common/inputs/ControlledBrandedTextField"
import { ControlledBrandedAutoComplete } from "components/views/common/inputs/ControlledBrandedAutoComplete"
import { ControlledBrandedCheckBox } from "components/views/common/inputs/ControlledBrandedCheckbox"

// ✅ CORRECT - Form-controlled inputs
;<ControlledBrandedTextField
   name="email"
   control={control}
   label="Email Address"
   rules={{ required: "Email is required" }}
/>
```

### Menu & Dialog Components

```tsx
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import BrandedResponsiveMenu from "components/views/common/inputs/BrandedResponsiveMenu"
import ConfirmationDialog from "materialUI/GlobalModals/ConfirmationDialog"

// ✅ CORRECT - Desktop menu
<BrandedMenu
   anchorEl={anchorEl}
   open={open}
   onClose={handleClose}
>
   <MenuItem onClick={handleAction}>Action</MenuItem>
</BrandedMenu>

// ✅ CORRECT - Responsive menu (desktop + mobile)
<BrandedResponsiveMenu
   options={[
      { label: "Edit", icon: <Edit />, handleClick: handleEdit },
      { label: "Delete", icon: <Trash2 />, handleClick: handleDelete }
   ]}
   open={open}
   anchorEl={anchorEl}
   handleClose={handleClose}
/>
```

### Component Mapping Reference

| Need            | Use This Branded Component               |
| --------------- | ---------------------------------------- |
| Text Input      | `BrandedTextField`                       |
| Search Field    | `BrandedSearchField`                     |
| Dropdown/Select | `BrandedAutocomplete`                    |
| Checkbox        | `BrandedCheckbox`                        |
| Radio Button    | `BrandedRadio`                           |
| Toggle/Switch   | `BrandedSwitch`                          |
| Menu/Dropdown   | `BrandedMenu` or `BrandedResponsiveMenu` |
| Modal/Dialog    | `ConfirmationDialog`                     |
| Badge           | `BrandedBadge`                           |

---

## 📐 COMMON LAYOUT PATTERNS

### Card Layout

```tsx
<Card sx={{ p: 3, borderRadius: "12px" }}>
   <Typography variant="brandedH4" sx={{ mb: 2 }}>
      Card Title
   </Typography>
   <Typography variant="medium" color="text.secondary">
      Card content
   </Typography>
</Card>
```

### Stack Layout

```tsx
<Stack spacing={2} direction="row" alignItems="center">
   <Search size={20} color={theme.palette.neutral[600]} />
   <Typography variant="medium">Label</Typography>
</Stack>

// Responsive direction
<Stack
   spacing={2}
   direction={{ xs: "column", tablet: "row" }}
   alignItems={{ xs: "stretch", tablet: "center" }}
>
   <Button>Action 1</Button>
   <Button>Action 2</Button>
</Stack>
```

### Box with Theme Colors

```tsx
<Box
   sx={{
      backgroundColor: (theme) => theme.brand.white[100],
      border: 1,
      borderColor: "neutral.200",
      borderRadius: "8px",
      p: 2,
   }}
>
   Content
</Box>
```

---

## ✅ PRE-FLIGHT CHECKLIST

Before submitting any code:

1. ✅ All colors use theme palette paths (no hex codes)
2. ✅ Brand colors use theme function: `theme => theme.brand.X[Y]`
3. ✅ Typography uses variant prop only (no fontSize/fontWeight)
4. ✅ Complex styling uses sxStyles helper
5. ✅ Spacing uses theme units (p: 2, m: 1) or theme.spacing()
6. ✅ Existing branded components are used
7. ✅ Icons are from react-feather when available
8. ✅ Buttons use theme variants and colors
9. ✅ Responsive design uses custom breakpoints
10.   ✅ No hardcoded media queries

---

## 🧪 TESTING UI COMPONENTS

### Unit Tests

```bash
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
```

Located in `apps/web/` - Jest with jsdom environment.

Configuration: `apps/web/jest.config.ts` uses custom jsdom environment from `config-jest` and Next.js babel preset.

### E2E Tests

```bash
npm run test:e2e-webapp        # Run E2E tests
npm run test:e2e-webapp-debug  # Debug mode
```

Playwright tests with Firebase emulators for critical flows:

-  User signup and email verification
-  Login flows
-  Livestream discovery
-  Group admin operations
-  Real-time updates

---

## 🎯 STATE MANAGEMENT PATTERNS

### Hybrid Approach

1. **Reactfire Hooks** - Direct Firestore queries (real-time)
2. **Redux Store** - Global UI state and caching
3. **Context API** - Feature-specific state
4. **SWR** - Function calls and API data

### Example Flow

```tsx
// 1. Subscribe via Reactfire
const { data: livestream, isLoading } = useFirestoreDocumentData(
   doc(db, "livestreams", id)
)

// 2. Transform with presenter
const formatted = LivestreamPresenter.format(livestream)

// 3. Cache in Redux (optional)
dispatch(setCurrentLivestream(formatted))

// 4. Render with real-time updates
return <LivestreamCard data={formatted} />
```

### When to Use Each

**Reactfire** - Use for:

-  Real-time Firestore subscriptions
-  Auth state
-  Direct document/collection queries

**Redux** - Use for:

-  Global UI state (modals, drawer state)
-  Cross-component data
-  Caching for offline support

**Context** - Use for:

-  Feature-specific state (streaming session, notifications)
-  Theme/styling state
-  State that doesn't need Redux

**SWR** - Use for:

-  Cloud Function calls
-  REST API data fetching
-  Data that needs revalidation

---

## 🚀 PERFORMANCE TIPS

### Web App

-  Use `next/image` for automatic image optimization
-  Code splitting handled by Next.js per-page
-  Bundle analysis: `ANALYZE=true npm run build`
-  Client caching: Redux + SWR + Reactfire query caching

### React Performance

-  `React.memo()` for expensive components
-  `useCallback` for event handlers passed to children
-  `useMemo` for expensive computations
-  `react-window` or `@tanstack/react-virtual` for long lists

### Firestore Performance

-  Create composite indexes for complex filters
-  Use subcollections for hierarchical data
-  Minimize `get()` calls in security rules
-  Cache computed results in `cache/` collection

---

## 📚 DESIGN SYSTEM RESOURCES

-  **MUI Components**: https://mui.com/material-ui/all-components/
-  **Theme files**: `packages/config-mui/` (palette, typography, components, breakpoints)
-  **Component examples**: `apps/web/components/`
-  **Branded components**: `apps/web/components/views/common/inputs/`
-  **React Feather icons**: https://feathericons.com/

**Remember**: The design system ensures consistency and productivity. Always use it!
