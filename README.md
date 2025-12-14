# Delivery Management System - Frontend Application

A modern, responsive web application for managing delivery operations, built with React and TypeScript. This frontend provides an intuitive user interface for customers, drivers, and administrators to interact with the delivery management system.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Key Features](#key-features)
- [Security Features](#security-features)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This frontend application is a comprehensive delivery management platform that enables seamless interaction between customers, drivers, and administrators. Built with modern web technologies, it provides a smooth, responsive user experience across desktop and mobile devices.

The application features real-time order tracking, secure payment processing, intuitive dashboards, and comprehensive administrative tools, all wrapped in a beautiful, accessible user interface.

## ✨ Features

### Customer Features
- **Order Management**: Create, track, and manage delivery orders
- **Real-time Tracking**: Live map view with driver location updates
- **Payment Processing**: Secure payment integration with Chapa
- **Address Book**: Save and manage delivery addresses
- **Order History**: View past orders and delivery status
- **In-app Messaging**: Communicate directly with assigned drivers
- **Analytics Dashboard**: View spending and order statistics

### Driver Features
- **Delivery Dashboard**: Manage assigned deliveries
- **Live Navigation**: Real-time location tracking and route optimization
- **Earnings Tracking**: Monitor daily, weekly, and total earnings
- **Delivery Proof**: Upload delivery confirmation images
- **Order Status Updates**: Update order status (Picked Up, On the Way, Delivered)
- **Customer Communication**: Chat with customers

### Admin Features
- **Comprehensive Dashboard**: System overview with key metrics
- **Order Management**: View and manage all orders
- **User Management**: Manage customers and drivers
- **Pricing Configuration**: Configure service offerings and pricing
- **Analytics & Reports**: Business intelligence and performance metrics
- **FAQ Management**: Manage frequently asked questions
- **Payment Monitoring**: Track and manage payment transactions
- **Live Map View**: Monitor all active deliveries in real-time

### General Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching for user preference
- **Real-time Notifications**: WebSocket-based push notifications
- **Email Verification**: Secure account verification
- **Password Reset**: Secure password recovery flow
- **Multi-language Support**: Ready for internationalization

## 🛠 Technology Stack

- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Maps**: Leaflet & React Leaflet
- **Charts**: Recharts
- **Forms**: React Hook Form
- **WebSocket**: SockJS & STOMP.js
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For version control

### Recommended Tools
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hasset_Delivery_Front-End_Side
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Configuration](#configuration) section)

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Application Configuration
VITE_APP_NAME=Delivery Management System
VITE_APP_VERSION=1.0.0
```

### Environment-Specific Configuration

- **Development**: Uses `.env` file
- **Production**: Set environment variables in your hosting platform

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Starts the development server with hot module replacement (HMR) at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## 📁 Project Structure

```
Hasset_Delivery_Front-End_Side/
├── public/                 # Static assets
│   └── ourlogo.jpg
├── src/
│   ├── assets/            # Images and static files
│   ├── components/        # React components
│   │   ├── admin/        # Admin-specific components
│   │   ├── auth/         # Authentication components
│   │   ├── driver/       # Driver-specific components
│   │   ├── global/       # Shared global components
│   │   ├── order/        # Order-related components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   │   ├── admin/       # Admin pages
│   │   └── driver/      # Driver pages
│   ├── services/         # API service layer
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 👥 User Roles

### Customer
- Create and manage delivery orders
- Track orders in real-time
- Make payments
- Communicate with drivers
- View order history and analytics

### Driver
- View assigned deliveries
- Update delivery status
- Upload delivery proof
- Track earnings
- Navigate to delivery locations
- Communicate with customers

### Administrator
- Full system access
- Manage users, orders, and drivers
- Configure pricing and services
- View analytics and reports
- Manage FAQs and system settings

## 🔑 Key Features

### Real-time Updates
- WebSocket integration for live order tracking
- Real-time driver location updates
- Instant notifications for order status changes
- Live chat between customers and drivers

### Security
- JWT-based authentication
- Secure token storage
- Input validation and sanitization
- XSS protection
- Safe redirect handling
- API request/response interceptors

### User Experience
- Responsive design for all devices
- Dark/light theme support
- Smooth animations and transitions
- Loading states and error handling
- Form validation with helpful error messages
- Accessible UI components

### Performance
- Code splitting and lazy loading
- Optimized bundle size
- Efficient state management
- Memoization for expensive operations
- Image optimization

## 🔒 Security Features

### Authentication
- Secure JWT token management
- Automatic token refresh
- Token expiration handling
- Secure logout with token blacklisting

### Input Validation
- Client-side validation for all forms
- Email format validation
- Password strength requirements
- Phone number validation
- Address validation

### Data Protection
- XSS prevention through input sanitization
- Safe redirect URL validation
- Secure API communication (HTTPS)
- No sensitive data in localStorage (except tokens)

### API Security
- Request interceptors for authentication
- Response interceptors for error handling
- Automatic token attachment to requests
- CORS-aware configuration

## 🏗️ Building for Production

### Build Command

```bash
npm run build
```

This will:
- Optimize and minify code
- Tree-shake unused code
- Generate production-ready assets
- Create source maps for debugging

### Build Output

The build process creates a `dist/` directory containing:
- Optimized JavaScript bundles
- Minified CSS files
- Static assets
- `index.html` entry point

### Deployment Checklist

1. **Environment Variables**: Set production API URL
2. **Build**: Run `npm run build`
3. **Test Build**: Run `npm run preview` to test locally
4. **Optimize**: Review bundle size and optimize if needed
5. **HTTPS**: Ensure HTTPS is enabled in production
6. **CORS**: Verify CORS settings match backend configuration

## 🚢 Deployment

### Static Hosting Platforms

The application can be deployed to any static hosting service:

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages
```bash
npm run build
# Deploy dist/ directory to gh-pages branch
```

#### AWS S3 + CloudFront
1. Build the application
2. Upload `dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain

### Environment Variables in Production

Set the following environment variables in your hosting platform:
- `VITE_API_URL`: Production API endpoint
- Any other required environment variables

## 🐛 Troubleshooting

### Common Issues

**Issue**: Application won't start
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`
- **Solution**: Check Node.js version (requires 18+)
- **Solution**: Verify all environment variables are set

**Issue**: API requests failing
- **Solution**: Verify `VITE_API_URL` is correct
- **Solution**: Check CORS configuration on backend
- **Solution**: Verify backend server is running

**Issue**: WebSocket connection fails
- **Solution**: Check WebSocket URL configuration
- **Solution**: Verify backend WebSocket endpoint is accessible
- **Solution**: Check firewall/proxy settings

**Issue**: Build fails
- **Solution**: Clear build cache: `rm -rf dist node_modules/.vite`
- **Solution**: Update dependencies: `npm update`
- **Solution**: Check for TypeScript errors: `npx tsc --noEmit`

**Issue**: Styling issues
- **Solution**: Verify Tailwind CSS is properly configured
- **Solution**: Check if CSS is imported in `main.tsx`
- **Solution**: Clear browser cache

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 Version History

- **v1.0.0**: Initial release
  - Complete customer interface
  - Driver dashboard
  - Admin panel
  - Real-time tracking
  - Payment integration

## 📞 Support

For technical support or questions:
- Check the browser console for errors
- Review network requests in DevTools
- Verify environment configuration
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ using React and TypeScript**
