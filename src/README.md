# Kuru Delivery Platform - Frontend

A modern, responsive, and high-performance delivery service platform built with React.js and Tailwind CSS.

## 🚀 Features

### Core Features
- **Modern & Responsive Design** - Optimized for all devices (desktop, tablet, mobile)
- **Dark/Light Mode** - Seamless theme switching with persistent preferences
- **Smooth Animations** - Professional animations using Motion (Framer Motion)
- **SEO Optimized** - Meta tags, semantic HTML, and accessibility features
- **Component-Based Architecture** - Reusable, maintainable components
- **Type-Safe** - Built with TypeScript for reliability

### Pages
1. **Homepage** - Hero section, features, stats, and call-to-action
2. **About Us** - Company story, mission, vision, values, and timeline
3. **Services** - Comprehensive service listings with features
4. **Pricing** - Transparent pricing plans with cost calculator
5. **Track Order** - Real-time package tracking interface
6. **Contact** - Contact form, business information, and map
7. **FAQ** - Searchable accordion with categorized questions
8. **Login/Signup** - Authentication pages with social login options

### Key Components
- **Header** - Responsive navigation with theme toggle
- **Footer** - Comprehensive footer with links and contact info
- **SEO Component** - Dynamic meta tags for all pages
- **Animated Sections** - Scroll-triggered animations
- **Loading States** - Skeleton screens and spinners
- **Theme Toggle** - Smooth dark/light mode switching

## 🎨 Design System

### Colors
- **Primary:** `#FF6600` (Brand Orange)
- **Secondary:** `#1A1A1A` (Dark Gray)
- **Background:** `#F1F1F1` (Light Gray)

### Typography
- **Headings:** Poppins (Google Fonts)
- **Body Text:** Inter (Google Fonts)

### Style Approach
- Clean, futuristic, and minimal design
- Grid-based layouts with generous whitespace
- Consistent component styling using ShadCN UI
- Smooth transitions and micro-interactions

## 🛠️ Tech Stack

### Core
- **React.js** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### Libraries
- **Motion (Framer Motion)** - Animations and transitions
- **ShadCN UI** - Pre-built accessible components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Recharts** - Charts and graphs (available for future use)

### Build Tools
- **Vite** - Fast build tool and dev server
- Modern ES modules with hot module replacement

## 📁 Project Structure

```
kuru-delivery-frontend/
├── components/
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   ├── global/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SEO.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── AnimatedSection.tsx
│   └── ui/
│       └── [ShadCN components]
├── contexts/
│   └── ThemeContext.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ServicesPage.tsx
│   ├── PricingPage.tsx
│   ├── TrackOrderPage.tsx
│   ├── ContactPage.tsx
│   ├── FAQPage.tsx
│   ├── LoginPage.tsx
│   └── SignupPage.tsx
├── styles/
│   └── globals.css
├── App.tsx
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd kuru-delivery-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start development server
```bash
npm run dev
# or
yarn dev
```

4. Build for production
```bash
npm run build
# or
yarn build
```

## 🎯 Routes

### Public Routes
- `/` - Homepage
- `/about` - About Us
- `/services` - Services
- `/pricing` - Pricing & Calculator
- `/track-order` - Track Order
- `/contact` - Contact Us
- `/faq` - FAQ
- `/login` - Login
- `/signup` - Sign Up

## 🔌 API Integration Ready

The frontend is structured to easily integrate with backend APIs:

### Example Integration Points

**Authentication:**
```typescript
// In LoginPage.tsx or SignupPage.tsx
const handleLogin = async (credentials) => {
  const response = await fetch('YOUR_API_URL/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  // Handle response
};
```

**Order Tracking:**
```typescript
// In TrackOrderPage.tsx
const trackPackage = async (trackingId) => {
  const response = await fetch(`YOUR_API_URL/track/${trackingId}`);
  const data = await response.json();
  setTrackingData(data);
};
```

**Pricing Calculator:**
```typescript
// In PricingPage.tsx
const calculateShipping = async (details) => {
  const response = await fetch('YOUR_API_URL/calculate', {
    method: 'POST',
    body: JSON.stringify(details),
  });
  return await response.json();
};
```

## 🎨 Customization

### Updating Colors
Edit `/styles/globals.css`:
```css
:root {
  --primary: #FF6600;  /* Change to your brand color */
  --secondary: #1A1A1A;
  /* ... other variables */
}
```

### Adding New Pages
1. Create page component in `/pages/`
2. Add route in `/App.tsx`
3. Add navigation link in `/components/global/Header.tsx`

### Extending Components
All UI components are located in `/components/ui/` and can be customized or extended.

## 🌐 SEO & Performance

### SEO Features
- Dynamic meta tags per page
- Semantic HTML structure
- Open Graph tags for social sharing
- Twitter Card support
- Accessible ARIA labels

### Performance Optimizations
- Code splitting via React Router
- Lazy loading for images (ImageWithFallback)
- Optimized animations with Motion
- Minimal bundle size with tree-shaking

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast compliance
- Screen reader friendly

## 🔮 Future Enhancements

### Suggested Additions
- **Backend Integration** - Connect to Node.js/Express or Django API
- **User Dashboard** - Account management and order history
- **Admin Panel** - Business analytics and order management
- **Payment Integration** - Stripe/PayPal checkout
- **Real-time Tracking** - WebSocket integration for live updates
- **Push Notifications** - Order status updates
- **Multi-language Support** - i18n integration
- **Advanced Analytics** - Google Analytics / Mixpanel

## 📄 License

This project is part of Kuru Delivery Services.

## 🤝 Contributing

This is a frontend-only implementation ready for backend integration. Follow the component structure and coding standards when adding new features.

## 📞 Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
