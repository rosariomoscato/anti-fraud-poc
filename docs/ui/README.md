# Anti-Fraud POC Design System

## Overview

This design system provides the foundation for building a professional, trustworthy, and secure anti-fraud detection interface. The system emphasizes clarity, data readability, and strategic use of visual alerts for fraud detection.

## Design Philosophy

### Core Principles
- **Trust & Security**: Professional appearance that inspires confidence in financial data handling
- **Clarity Over Density**: Prioritize readability and comprehension over information density
- **Strategic Alerts**: Use color and visual hierarchy to draw attention to critical fraud indicators
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Consistency**: Unified visual language across all components and interactions

### Target Users
- **Fraud Analysts**: Need clear data presentation and quick access to alerts
- **Investigators**: Require detailed information and workflow support
- **Administrators**: Need overview dashboards and system management tools
- **Compliance Officers**: Require audit trails and documentation features

## Quick Start

### Installation
The design system is built into the project using:
- **Tailwind CSS v4** with custom theming
- **Radix UI** for accessible primitives
- **shadcn/ui** for component foundations
- **Lucide React** for consistent iconography

### Basic Usage
```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function FraudAlert({ severity, message }) {
  return (
    <Card className="p-4">
      <Badge variant={severity === 'high' ? 'destructive' : 'secondary'}>
        {severity}
      </Badge>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </Card>
  );
}
```

## System Structure

### Documentation Files
- **[PRINCIPLES.md](./PRINCIPLES.md)**: Detailed design principles and guidelines
- **[TOKENS.md](./TOKENS.md)**: Color, typography, spacing, and component tokens
- **[COOKBOOK.md](./COOKBOOK.md)**: Common patterns and implementation examples

### Component Categories
- **Layout**: Containers, grids, and spacing systems
- **Navigation**: Headers, sidebars, and breadcrumbs
- **Data Display**: Cards, tables, charts, and data visualizations
- **Forms**: Inputs, selects, and validation patterns
- **Feedback**: Alerts, badges, status indicators, and loading states
- **Actions**: Buttons, links, and interactive elements

## Key Features

### Fraud Detection Visual Language
- **Risk Color Coding**: Green (low) → Yellow (medium) → Red (high/critical)
- **Alert Hierarchy**: Subtle badges → Warning cards → Critical notifications
- **Status Indicators**: Clear visual states for investigations and claims

### Professional Data Presentation
- **Clean Typography**: Readable fonts with proper hierarchy
- **Consistent Spacing**: Generous whitespace for readability
- **Accessible Colors**: High contrast ratios for all text elements

### Responsive Design
- **Mobile-First**: Optimized for tablets and mobile devices
- **Progressive Enhancement**: Enhanced experience on larger screens
- **Touch-Friendly**: Appropriate tap targets and gestures

## Contributing

When contributing to the design system:
1. Follow the established patterns and tokens
2. Test for accessibility compliance
3. Document new components and patterns
4. Maintain consistency with existing visual language

## Browser Support

- **Modern Browsers**: Latest versions of Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari 14+, Chrome for Android 90+
- **Screen Readers**: VoiceOver, NVDA, JAWS

## Performance Considerations

- **Optimized Assets**: Minimal CSS bundle size
- **Efficient Rendering**: Hardware-accelerated animations
- **Progressive Loading**: Critical content first, enhanced features second