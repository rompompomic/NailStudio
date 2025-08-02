# Overview

This is a full-stack web application for a nail salon business built with React/TypeScript frontend and Express.js backend. The application provides a modern landing page for the salon with services showcase, customer reviews, and booking functionality, plus a comprehensive admin panel for content management. It features Telegram bot integration for booking notifications and uses PostgreSQL with Drizzle ORM for data persistence.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom pastel color scheme optimized for nail salon aesthetics
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with separate public and admin endpoints
- **Authentication**: JWT-based authentication for admin panel access
- **File Uploads**: Multer middleware for image upload handling with file type validation
- **Development**: Hot reload with Vite integration for seamless full-stack development

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Shared TypeScript schema definitions between frontend and backend
- **Migrations**: Drizzle Kit for database schema management

## Data Models
- **Settings**: Master profile, contact info, social media links, and bot configuration
- **Blocks**: Configurable content sections (about, services, reviews, contacts)
- **Services**: Salon services with pricing and descriptions
- **Reviews**: Customer testimonials with optional photos
- **Requests**: Customer booking requests with service selection
- **Subscribers**: Telegram bot subscribers for notifications
- **Images**: File upload management with metadata

## Authentication & Security
- **Admin Access**: Password-based authentication with bcrypt hashing
- **Session Management**: JWT tokens for stateless authentication
- **File Security**: Restricted file upload types and size limits
- **Environment Variables**: Secure configuration management for sensitive data

## External Integrations
- **Telegram Bot**: Automated booking notifications to subscribed admins
- **Image Storage**: Local file system storage with configurable upload directory
- **Social Media**: Configurable links to Instagram, WhatsApp, and Telegram

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migrations and schema management
- **express**: Web application framework for Node.js
- **bcrypt**: Password hashing for admin authentication
- **multer**: File upload middleware for image handling
- **jsonwebtoken**: JWT implementation for admin sessions

## Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod integration for form validation
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting utilities

## UI Component Libraries
- **@radix-ui/react-**: Complete suite of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Modern icon library

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development enhancements

## Validation & Utilities
- **zod**: Runtime type validation and schema definition
- **clsx**: Conditional CSS class composition
- **nanoid**: Unique ID generation for entities