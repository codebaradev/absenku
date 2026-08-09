---
name: AbsenGuru Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-ui:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  touch-target-min: 48px
  margin-mobile: 16px
  margin-desktop: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system focuses on high-utility, professional reliability for educators. The brand personality is efficient, trustworthy, and authoritative, functioning as a silent utility that respects the teacher's time. 

The aesthetic is **Modern Minimalism** with a focus on high-contrast readability to accommodate outdoor geofence verification and bright classroom environments. It utilizes a structured "utility-first" appearance, prioritizing information density and clear success feedback. The UI should evoke a sense of professional calm and systematic precision.

## Colors
The palette is derived from high-contrast slate and zinc tones to ensure professional clarity.

- **Primary (Zinc-950/Slate-900):** Used for typography, primary buttons, and deep structural elements to ground the UI.
- **Accent (Emerald-500):** Reserved exclusively for positive actions, active attendance states, and successful geofence "In-Bounds" verification.
- **Destructive (Red-500):** Used for "Out-of-Bounds" alerts, late arrivals, and critical system errors.
- **Surface (Slate-50):** The primary background for cards and sheets to provide subtle separation from the white canvas.

## Typography
This design system uses **Inter** for its systematic, neutral qualities and high legibility on small screens. 

- **Hierarchy:** Use `display` for the clock-in time and `headline-lg` for primary page titles. 
- **Readability:** For mobile PWA usage, never drop below `body-sm` (14px) for functional text. 
- **Utility:** Use `mono-ui` (JetBrains Mono) for coordinate data, timestamps, or verification codes to distinguish raw data from instructional text.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first PWA delivery.

- **Touch Targets:** All interactive elements (buttons, checkboxes, list items) must maintain a minimum height/width of `48px` to ensure reliable input during transit or outdoor use.
- **Rhythm:** Use a strict 4px/8px baseline grid. 16px is the standard container padding for mobile devices.
- **Mobile Reflow:** On desktop views, the primary content container should be capped at 480px and centered to maintain the "app-like" feel of a PWA.

## Elevation & Depth
The design system utilizes **Tonal Layers** rather than heavy shadows to maintain a clean, modern aesthetic. 

- **Level 0 (Canvas):** Pure white (#FFFFFF). Used for the main background.
- **Level 1 (Surface):** Slate-50. Used for card backgrounds and inset sections.
- **Level 2 (Interaction):** Thin 1px borders (#E2E8F0) replace shadows for most components.
- **Overlays:** Use a high-blur backdrop (8px) for Dialogs and Sheets with a 40% opacity Slate-900 overlay to keep focus on the action at hand.

## Shapes
The shape language is **Soft** and professional. 

- **Buttons & Inputs:** Use `0.25rem` (4px) or `rounded-md` to maintain a crisp, serious look.
- **Cards & Dialogs:** Use `rounded-lg` (8px) to soften the large surface areas.
- **Status Badges:** Use fully rounded pill shapes to distinguish them from interactive buttons.

## Components
Consistent styling instructions for core components:

- **Buttons:** High-contrast Primary (Zinc-950 with White text) for main actions like "Clock In". Outline variants for secondary actions like "View History". All buttons must be at least 48px tall.
- **Badges:** Use Emerald-500 backgrounds with white text for "Present" or "Verified". Use Red-500 for "Out of Bounds".
- **Cards:** White background with a 1px Slate-200 border. No shadows. Use for daily stats and schedule overviews.
- **Input Fields:** Large tap targets with 16px internal padding. Focus state uses a 2px ring of Zinc-950.
- **Geofence Indicator:** A specialized Card component featuring a live map or a large status icon (Shield Check for success, Map Pin for searching).
- **Attendance Table:** Simplified for mobile; use a List view on small screens that expands into a formal Table on desktop, emphasizing the date and status badge.
- **Tabs:** Segmented control style (Slate-100 background with a sliding white active state) for switching between "Daily," "Weekly," and "Monthly" views.