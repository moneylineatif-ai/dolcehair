# Dolce Hair Website

A modern, luxurious hair salon landing page built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Modern Design**: Classic, luxurious, moody, and editorial aesthetic
- **Responsive**: Mobile-first design that works on all devices
- **Smooth Animations**: Framer Motion animations for a premium feel
- **Performance**: Optimized with Next.js 14 App Router
- **TypeScript**: Fully typed for better developer experience

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── layout.tsx       # Root layout with fonts
│   ├── page.tsx         # Main page
│   └── globals.css      # Global styles
├── components/
│   ├── Navbar.tsx       # Navigation bar
│   ├── Hero.tsx         # Hero section
│   ├── Services.tsx     # Services menu
│   ├── Gallery.tsx      # Gallery section
│   ├── Testimonials.tsx # Testimonials slider
│   ├── Footer.tsx       # Footer
│   └── FloatingCTA.tsx  # Floating book button
└── tailwind.config.ts   # Tailwind configuration
```

## Design System

### Colors
- Background: Rich Matte Black (#0f0f0f)
- Primary Accent: Deep Burgundy (#722F37)
- Secondary Accent: Warm Bronze (#A07855)
- Text: Off-white/Cream (#F5F5F5)

### Typography
- Headings: Playfair Display (Serif)
- Body: Inter (Sans-Serif)

## Build for Production

```bash
npm run build
npm start
```

