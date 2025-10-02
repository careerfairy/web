# SVG Color Definition Analysis

## 🎨 **How Colors are Defined in the Hero Section SVG Files**

The colors in the SVG files are defined using **CSS-style color values** within **linear gradients**. Here's the detailed breakdown:

## 📁 **Current SVG Files (Panels - Green Theme)**

### **Left Visual Support** (`header-left-visual-support.svg`)
```svg
<svg width="174" height="346" viewBox="0 0 174 346" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.07" width="174" height="346" rx="87" fill="url(#paint0_linear_4130_308283)"/>
<defs>
<linearGradient id="paint0_linear_4130_308283" x1="87" y1="0" x2="87" y2="346" gradientUnits="userSpaceOnUse">
<stop stop-color="#376B65"/>
<stop offset="1" stop-color="#376B65" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
```

### **Right Visual Support** (`header-right-visual-support.svg`)
```svg
<svg width="273" height="346" viewBox="0 0 273 346" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.05" width="273" height="346" rx="40" fill="url(#paint0_linear_4130_308284)"/>
<defs>
<linearGradient id="paint0_linear_4130_308284" x1="136.5" y1="0" x2="136.5" y2="346" gradientUnits="userSpaceOnUse">
<stop stop-color="#376B65"/>
<stop offset="1" stop-color="#376B65" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
```

## 📁 **Consulting SVG Files (Blue Theme - From Git History)**

### **Left Visual Support Consulting** (`header-left-visual-support-consulting.svg`)
```svg
<svg width="174" height="346" viewBox="0 0 174 346" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.07" width="174" height="346" rx="87" fill="url(#paint0_linear_consulting_left)"/>
<defs>
<linearGradient id="paint0_linear_consulting_left" x1="87" y1="0" x2="87" y2="346" gradientUnits="userSpaceOnUse">
<stop stop-color="#0091FF"/>
<stop offset="1" stop-color="#0091FF" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
```

### **Right Visual Support Consulting** (`header-right-visual-support-consulting.svg`)
```svg
<svg width="273" height="346" viewBox="0 0 273 346" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.05" width="273" height="346" rx="40" fill="url(#paint0_linear_consulting_right)"/>
<defs>
<linearGradient id="paint0_linear_consulting_right" x1="136.5" y1="0" x2="136.5" y2="346" gradientUnits="userSpaceOnUse">
<stop stop-color="#ADDCFF"/>
<stop offset="1" stop-color="#ADDCFF" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
```

## 🔍 **Color Definition Structure**

### **1. Linear Gradient Definition**
Colors are defined within `<linearGradient>` elements in the `<defs>` section:

```svg
<linearGradient id="unique_gradient_id" x1="87" y1="0" x2="87" y2="346" gradientUnits="userSpaceOnUse">
  <stop stop-color="#COLOR_HEX"/>
  <stop offset="1" stop-color="#COLOR_HEX" stop-opacity="0"/>
</linearGradient>
```

### **2. Color Application**
The gradient is applied to the rectangle via the `fill` attribute:
```svg
<rect fill="url(#unique_gradient_id)"/>
```

### **3. Gradient Direction**
- **Vertical gradient**: `x1="87" y1="0" x2="87" y2="346"`
- **From top to bottom**: Solid color at top (y=0) fading to transparent at bottom (y=346)

## 📊 **Color Comparison Table**

| Element | Panels (Green) | Consulting (Blue) |
|---------|----------------|-------------------|
| **Left SVG Color** | `#376B65` (dark green) | `#0091FF` (bright blue) |
| **Right SVG Color** | `#376B65` (dark green) | `#ADDCFF` (light blue) |
| **Left Opacity** | `0.07` | `0.07` |
| **Right Opacity** | `0.05` | `0.05` |
| **Gradient Direction** | Top to bottom fade | Top to bottom fade |

## 🎯 **Key Properties**

### **Shape Properties**
- **Left SVG**: Rounded rectangle with `rx="87"` (highly rounded)
- **Right SVG**: Rounded rectangle with `rx="40"` (moderately rounded)
- **Dimensions**: Left (174×346), Right (273×346)

### **Opacity Layers**
- **Rectangle opacity**: Applied at element level (`opacity="0.07"` or `opacity="0.05"`)
- **Gradient opacity**: Applied within gradient (`stop-opacity="0"` at bottom)
- **Double fade effect**: Creates subtle visual depth

### **Gradient Mechanics**
```svg
<!-- Gradient starts with solid color at top -->
<stop stop-color="#COLOR" />

<!-- Gradient ends with same color but transparent at bottom -->
<stop offset="1" stop-color="#COLOR" stop-opacity="0"/>
```

## 🛠 **How to Create Industry-Specific Variants**

To create SVG variants for our new industry pages, you would:

### **1. Duplicate Base Structure**
```svg
<svg width="174" height="346" viewBox="0 0 174 346" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect opacity="0.07" width="174" height="346" rx="87" fill="url(#paint0_linear_INDUSTRY)"/>
<defs>
<linearGradient id="paint0_linear_INDUSTRY" x1="87" y1="0" x2="87" y2="346" gradientUnits="userSpaceOnUse">
<stop stop-color="#INDUSTRY_COLOR"/>
<stop offset="1" stop-color="#INDUSTRY_COLOR" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
```

### **2. Update Colors for Each Industry**

**FMCG Variants:**
- Left: `stop-color="#F9A825"` (amber)
- Right: `stop-color="#E63946"` (red)

**Engineering Variants:**
- Left: `stop-color="#FFFFFF"` (white)
- Right: `stop-color="#9A9A9A"` (gray)

**Finance Variants:**
- Left: `stop-color="#0DFF00"` (bright green)
- Right: `stop-color="#2E7D32"` (dark green)

### **3. Maintain Consistent Structure**
- Keep same dimensions and border radius
- Preserve opacity values
- Maintain gradient direction
- Use unique gradient IDs

## 💡 **Design Philosophy**

The SVG approach provides:
- **Scalable graphics** that work at any resolution
- **Lightweight files** with minimal code
- **Easy color customization** through hex values
- **Consistent visual language** across industry variants
- **Subtle visual enhancement** without overwhelming content