# FloatingHighlightCard Component Documentation

## Overview

The `FloatingHighlightCard` is a modern, professional card component built with Ant Design that provides floating shadow effects and smooth animations for displaying highlight information. It's designed to integrate seamlessly with the existing Netflix-style design theme while offering enhanced visual appeal and user interaction.

## Features

- **Professional Shadow Effects**: Multi-layered shadows with hover enhancement
- **Elevation Animations**: Smooth scale and translate transforms on hover
- **Responsive Design**: Works seamlessly across all screen sizes
- **Multiple Variants**: Three display variants for different use cases
- **Media Support**: Enhanced image/video display with fallback states
- **Ant Design Integration**: Built using Ant Design components with custom styling
- **Theme Consistency**: Matches existing dark Netflix-style color scheme

## Component Props

```typescript
interface FloatingHighlightCardProps {
  highlight: Highlight & { media: Media[] };
  onClick?: () => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}
```

## Variants

### Default
- Standard card size with all information
- Ideal for grid layouts
- Shows title, company, description (truncated), date, and media count

### Compact
- Smaller size for dense layouts
- Minimal information display
- Perfect for sidebar or preview contexts

### Detailed
- Larger card with extended description
- More comprehensive information display
- Best for featured highlights or detailed views

## Visual Features

### Shadow and Elevation Effects
- **Base Shadow**: `0 8px 32px rgba(0, 0, 0, 0.3)`
- **Accent Shadow**: `0 2px 8px rgba(229, 9, 20, 0.1)` (Netflix red)
- **Hover Enhancement**: Scale to 102% with upward translation (-8px)
- **Advanced Shadow on Hover**: Enhanced shadow with red accent glow

### Animations
- **Transform Duration**: 300ms ease-out
- **Hover Scale**: 1.02x with -8px Y translation
- **Border Glow**: Netflix red accent border on hover
- **Background Gradient**: Subtle gradient shift on hover

### Media Display
- **Image Enhancement**: Scale animation on hover (110%)
- **Video Support**: Auto-play with muted loop
- **Fallback State**: Elegant placeholder with company branding
- **Media Counter**: Badge showing additional media count

## Usage Examples

### Basic Implementation

```tsx
import FloatingHighlightCard from '@/components/FloatingHighlightCard';

const MyComponent = () => {
  const highlight = {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Company',
    description: 'Led development of key features...',
    startDate: '2023-01-01',
    createdAt: '2023-01-01',
    media: []
  };

  return (
    <FloatingHighlightCard 
      highlight={highlight}
      onClick={() => console.log('Card clicked')}
    />
  );
};
```

### Grid Layout with HighlightCardGrid

```tsx
import HighlightCardGrid from '@/components/HighlightCardGrid';

const HighlightsSection = () => {
  return (
    <HighlightCardGrid
      highlights={highlights}
      title="Featured Highlights"
      variant="default"
      showActions={true}
      gridProps={{ xs: 24, sm: 12, md: 8, lg: 6 }}
      onCardClick={(highlight) => handleCardClick(highlight)}
    />
  );
};
```

### Admin Interface Integration

```tsx
// Toggle between table and card view
const [isCardView, setIsCardView] = useState(false);

return (
  <div>
    <Switch checked={isCardView} onChange={setIsCardView} />
    
    {isCardView ? (
      <HighlightCardGrid
        highlights={highlights}
        variant="detailed"
        showActions={true}
        onCardClick={handleEdit}
      />
    ) : (
      <Table dataSource={highlights} columns={columns} />
    )}
  </div>
);
```

## Design Integration

### Color Scheme
- **Background**: #303030 (Netflix card background)
- **Hover Background**: #353535
- **Text Primary**: #ffffff
- **Text Secondary**: #e50914 (Netflix red)
- **Text Muted**: rgba(255, 255, 255, 0.6)
- **Border**: #404040 / #e50914 (hover)

### Typography
- **Title**: Bold, white text with ellipsis overflow
- **Company**: Netflix red accent color
- **Description**: Muted white with multi-line ellipsis
- **Date**: Small muted text with calendar icon

### Responsive Breakpoints
- **xs** (< 576px): Full width cards
- **sm** (≥ 576px): 2 columns
- **md** (≥ 768px): 3 columns
- **lg** (≥ 992px): 4 columns
- **xl** (≥ 1200px): 4-6 columns
- **xxl** (≥ 1600px): 6+ columns

## Performance Considerations

- **Image Optimization**: Lazy loading and error handling
- **Animation Performance**: Hardware-accelerated transforms
- **Memory Management**: Proper cleanup of video elements
- **Bundle Size**: Minimal additional dependencies

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG compliant color ratios
- **Focus Indicators**: Clear focus states for all interactive elements

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **CSS Features**: CSS Grid, Flexbox, Backdrop-filter
- **JavaScript**: ES2020+ features

## Future Enhancements

- [ ] Virtual scrolling for large datasets
- [ ] Advanced filtering and sorting
- [ ] Drag and drop reordering
- [ ] Custom themes and color schemes
- [ ] Animation preferences and reduced motion support
- [ ] Internationalization support

## Related Components

- `HighlightCardGrid`: Grid layout wrapper for multiple cards
- `HighlightCard`: Original hero-style highlight display
- `EducationCard`: Similar card pattern for education
- `SkillCard`: Compact card variant for skills