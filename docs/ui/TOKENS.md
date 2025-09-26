# Design Tokens

## Overview

Design tokens are the visual design atoms of the design system. They represent the smallest stylistic elements like colors, typography, spacing, and more. Using tokens ensures consistency across all components and makes theming easier.

## Color Tokens

### Primary Colors (Base)
```css
/* Core brand colors - professional and trustworthy */
--color-primary: oklch(0.21 0.006 285.885);      /* Deep blue-gray */
--color-primary-foreground: oklch(0.985 0 0);  /* White text */
```

### Risk & Alert Colors (Fraud Detection)
```css
/* Risk-based color coding for fraud detection */
--color-risk-low: oklch(0.646 0.222 41.116);     /* Green - success/low risk */
--color-risk-medium: oklch(0.6 0.118 184.704);   /* Yellow/amber - medium risk */
--color-risk-high: oklch(0.577 0.245 27.325);    /* Orange - high risk */
--color-risk-critical: oklch(0.577 0.245 27.325); /* Red - critical/fraud */

/* Supporting colors for different states */
--color-success: var(--color-risk-low);
--color-warning: var(--color-risk-high);
--color-destructive: var(--color-risk-critical);
```

### Neutral Colors (Background & Text)
```css
/* Background and foreground colors */
--color-background: oklch(1 0 0);               /* Pure white */
--color-foreground: oklch(0.141 0.005 285.823); /* Very dark gray */
--color-card: oklch(1 0 0);                     /* White card backgrounds */
--color-card-foreground: oklch(0.141 0.005 285.823);
--color-popover: oklch(1 0 0);                  /* White popover/tooltip bg */
--color-popover-foreground: oklch(0.141 0.005 285.823);
```

### Muted Colors (Secondary Elements)
```css
/* Secondary and muted colors */
--color-secondary: oklch(0.967 0.001 286.375);   /* Very light gray */
--color-secondary-foreground: oklch(0.21 0.006 285.885);
--color-muted: oklch(0.967 0.001 286.375);      /* Light gray backgrounds */
--color-muted-foreground: oklch(0.552 0.016 285.938); /* Medium gray text */
--color-accent: oklch(0.967 0.001 286.375);     /* Interactive elements */
--color-accent-foreground: oklch(0.21 0.006 285.885);
```

### Border & Input Colors
```css
/* Borders and form elements */
--color-border: oklch(0.92 0.004 286.32);       /* Light gray borders */
--color-input: oklch(0.92 0.004 286.32);         /* Input field backgrounds */
--color-ring: oklch(0.705 0.015 286.067);        /* Focus ring color */
```

### Chart Colors (Data Visualization)
```css
/* Consistent color palette for charts and graphs */
--color-chart-1: oklch(0.646 0.222 41.116);      /* Green/amber */
--color-chart-2: oklch(0.6 0.118 184.704);       /* Teal/cyan */
--color-chart-3: oklch(0.398 0.07 227.392);      /* Blue */
--color-chart-4: oklch(0.828 0.189 84.429);      /* Yellow/green */
--color-chart-5: oklch(0.769 0.188 70.08);       /* Orange */
```

### Dark Mode Colors
```css
.dark {
  /* Inverted for dark theme while maintaining contrast */
  --color-background: oklch(0.141 0.005 285.823);
  --color-foreground: oklch(0.985 0 0);
  --color-card: oklch(0.21 0.006 285.885);
  --color-card-foreground: oklch(0.985 0 0);
  /* ... other dark mode variants */
}
```

## Typography Tokens

### Font Stack
```css
/* Font family tokens */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

### Font Sizes
```css
/* Responsive font sizing with rem units */
--text-xs: 0.75rem;     /* 12px - captions, fine print */
--text-sm: 0.875rem;    /* 14px - helper text, labels */
--text-base: 1rem;      /* 16px - body text, default */
--text-lg: 1.125rem;    /* 18px - larger body text */
--text-xl: 1.25rem;     /* 20px - subheadings */
--text-2xl: 1.5rem;     /* 24px - section headings */
--text-3xl: 1.875rem;   /* 30px - page headings */
--text-4xl: 2.25rem;    /* 36px - main titles */
--text-5xl: 3rem;       /* 48px - hero text */
```

### Font Weights
```css
/* Font weight tokens */
--font-thin: 100;       /* Thin - minimal usage */
--font-extralight: 200; /* Extra light */
--font-light: 300;      /* Light - large headings */
--font-normal: 400;    /* Normal - body text */
--font-medium: 500;     /* Medium - emphasis, buttons */
--font-semibold: 600;   /* Semibold - headings, emphasis */
--font-bold: 700;      /* Bold - strong emphasis */
--font-extrabold: 800; /* Extra bold - minimal usage */
--font-black: 900;     /* Black - display text */
```

### Line Heights
```css
/* Line height tokens for readability */
--leading-none: 1;          /* Tight - headings */
--leading-tight: 1.25;      /* Tight - compact text */
--leading-snug: 1.375;      /* Snug - most body text */
--leading-normal: 1.5;       /* Normal - comfortable reading */
--leading-relaxed: 1.625;    /* Relaxed - extended reading */
--leading-loose: 2;          /* Loose - large text blocks */
```

### Letter Spacing
```css
/* Letter spacing tokens */
--tracking-tighter: -0.025em;
--tracking-tight: -0.0125em;
--tracking-normal: 0;
--tracking-wide: 0.0125em;
--tracking-wider: 0.025em;
--tracking-widest: 0.05em;
```

## Spacing Tokens

### Base Spacing Scale
```css
/* 4px base spacing system for consistency */
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-11: 2.75rem;     /* 44px */
--space-12: 3rem;        /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
--space-40: 10rem;       /* 160px */
--space-48: 12rem;       /* 192px */
--space-56: 14rem;       /* 224px */
--space-64: 16rem;       /* 256px */
```

### Component Spacing Patterns
```css
/* Common component spacing patterns */
--component-padding-xs: var(--space-2) var(--space-3);    /* 8px 12px */
--component-padding-sm: var(--space-3) var(--space-4);    /* 12px 16px */
--component-padding-md: var(--space-4) var(--space-6);    /* 16px 24px */
--component-padding-lg: var(--space-6) var(--space-8);    /* 24px 32px */
--component-padding-xl: var(--space-8) var(--space-12);   /* 32px 48px */

--gap-xs: var(--space-2);     /* 8px */
--gap-sm: var(--space-4);     /* 16px */
--gap-md: var(--space-6);     /* 24px */
--gap-lg: var(--space-8);     /* 32px */
--gap-xl: var(--space-12);    /* 48px */
```

## Border Radius Tokens

```css
/* Consistent border radius for rounded elements */
--radius-none: 0;              /* Square corners */
--radius-sm: calc(var(--radius) - 4px);  /* 2px - subtle rounding */
--radius-md: calc(var(--radius) - 2px);  /* 4px - moderate rounding */
--radius-lg: var(--radius);               /* 6px - standard rounding */
--radius-xl: calc(var(--radius) + 4px);  /* 10px - prominent rounding */
--radius-full: 9999px;         /* Fully rounded (circles) */

/* Base radius token */
--radius: 0.625rem;            /* 10px */
```

## Shadow Tokens

```css
/* Subtle shadow system for depth and hierarchy */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored shadows for specific use cases */
--shadow-success: 0 4px 6px -1px rgb(34 197 94 / 0.1);
--shadow-warning: 0 4px 6px -1px rgb(251 146 60 / 0.1);
--shadow-destructive: 0 4px 6px -1px rgb(239 68 68 / 0.1);
```

## Animation Tokens

### Timing Functions
```css
/* Easing functions for natural motion */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations
```css
/* Animation durations in milliseconds */
--duration-75: 75ms;      /* Very fast - micro-interactions */
--duration-100: 100ms;    /* Fast - simple transitions */
--duration-150: 150ms;    /* Default - most transitions */
--duration-200: 200ms;    /* Moderate - complex transitions */
--duration-300: 300ms;    /* Slow - major state changes */
--duration-500: 500ms;    /* Very slow - page transitions */
```

## Z-Index Scale

```css
/* Consistent z-index hierarchy */
--z-dropdown: 1000;       /* Dropdown menus */
--z-sticky: 1020;         /* Sticky elements */
--z-fixed: 1030;          /* Fixed positioning */
--z-modal-backdrop: 1040; /* Modal backdrop */
--z-modal: 1050;          /* Modal content */
--z-popover: 1060;        /* Popovers and tooltips */
--z-tooltip: 1070;        /* Tooltips */
--z-notification: 1080;   /* Notifications/toasts */
```

## Component-Specific Tokens

### Button Tokens
```css
/* Button sizing and spacing */
--button-height-sm: 2rem;     /* 32px */
--button-height-md: 2.5rem;    /* 40px */
--button-height-lg: 3rem;      /* 48px */

--button-padding-sm: 0.5rem 1rem;    /* 8px 16px */
--button-padding-md: 0.75rem 1.5rem;  /* 12px 24px */
--button-padding-lg: 1rem 2rem;      /* 16px 32px */

--button-font-size-sm: var(--text-sm);
--button-font-size-md: var(--text-base);
--button-font-size-lg: var(--text-lg);

--button-border-radius: var(--radius-md);
```

### Form Input Tokens
```css
/* Form input sizing and styling */
--input-height-sm: 2rem;     /* 32px */
--input-height-md: 2.5rem;    /* 40px */
--input-height-lg: 3rem;      /* 48px */

--input-padding-sm: 0.375rem 0.75rem;  /* 6px 12px */
--input-padding-md: 0.5rem 1rem;      /* 8px 16px */
--input-padding-lg: 0.75rem 1.5rem;  /* 12px 24px */

--input-border-width: 1px;
--input-border-color: var(--color-border);
--input-border-focus: var(--color-ring);

--input-border-radius: var(--radius-md);
```

### Card Tokens
```css
/* Card component tokens */
--card-padding-sm: var(--space-4);     /* 16px */
--card-padding-md: var(--space-6);     /* 24px */
--card-padding-lg: var(--space-8);     /* 32px */

--card-border-radius: var(--radius-lg);
--card-border-width: 1px;
--card-border-color: var(--color-border);

--card-shadow-sm: var(--shadow-sm);
--card-shadow-md: var(--shadow-md);
--card-shadow-lg: var(--shadow-lg);
```

### Table Tokens
```css
/* Table component tokens */
--table-cell-padding: var(--space-3) var(--space-4);  /* 12px 16px */
--table-header-padding: var(--space-4);               /* 16px */
--table-border-color: var(--color-border);
--table-header-bg: var(--color-muted);
--table-row-hover-bg: var(--color-accent);
--table-stripe-bg: oklch(0.98 0 0);                    /* Very light gray */
```

## Responsive Breakpoints

```css
/* Mobile-first responsive breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large desktop */
```

## Usage in Tailwind CSS

These tokens are automatically available in your Tailwind CSS configuration through the CSS custom properties defined in `globals.css`. Use them like this:

```tsx
// Example usage in components
<div className="p-6 bg-card text-card-foreground rounded-lg shadow-md">
  <h2 className="text-2xl font-semibold mb-4">Investigation Summary</h2>
  <div className="text-muted-foreground">
    Risk Level: <span className="text-risk-high font-medium">High</span>
  </div>
</div>
```

## Custom Token Usage

To add custom tokens, extend the CSS custom properties in `src/app/globals.css`:

```css
:root {
  /* Custom success color variant */
  --color-success-100: oklch(0.96 0.03 142);
  --color-success-200: oklch(0.92 0.06 142);
  --color-success-500: var(--color-success);
  --color-success-700: oklch(0.52 0.18 142);
  
  /* Custom spacing for specific components */
  --space-inset-sm: var(--space-2) var(--space-3);
  --space-inset-md: var(--space-4) var(--space-6);
}
```