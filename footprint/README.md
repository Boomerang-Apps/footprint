# Footprint - AI Photo Printing Studio

> Transform everyday photos into museum-quality art prints with AI-powered style transformation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
footprint/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Public pages (landing)
│   ├── (app)/              # Protected app pages
│   │   └── create/         # Order creation flow
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── upload/             # Photo upload
│   ├── style-picker/       # AI style selection
│   ├── product-config/     # Size, paper, frame
│   └── checkout/           # Payment flow
├── lib/
│   ├── api/                # API abstraction layer
│   │   ├── client.ts       # Unified API client
│   │   ├── mock.ts         # Mock for development
│   │   └── uzerflow.ts     # Uzerflow SDK (when ready)
│   ├── ai/                 # AI integration
│   └── storage/            # File storage (R2)
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand state management
└── types/                  # TypeScript types
```

## 🔧 Configuration

### Development Mode (Mock API)

Set in `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK=true
```

This uses the mock API client with simulated data, allowing full development without Uzerflow.

### Production Mode (Uzerflow)

When Uzerflow is ready, set:
```env
NEXT_PUBLIC_USE_MOCK=false
UZERFLOW_API_URL=https://api.uzerflow.com
UZERFLOW_API_KEY=uz_your_key
```

## 🎨 Key Features

### For Users
- **Photo Upload**: Camera roll integration, drag-and-drop
- **AI Styles**: 8+ curated artistic styles
- **Customization**: Size, paper, frame options
- **Gift Flow**: Personal messages, recipient shipping
- **Fast Checkout**: Stripe, Apple Pay, Google Pay

### For Admins
- **Order Dashboard**: View, manage, fulfill orders
- **Status Updates**: Track order progress
- **Print Files**: Download high-res print-ready files

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| State | Zustand, TanStack Query |
| Backend | Uzerflow (or Mock) |
| AI | Replicate API |
| Storage | Cloudflare R2 |
| Payments | Stripe |
| Hosting | Vercel |

## 📱 API Abstraction

The `lib/api/client.ts` provides a unified interface that works with both mock data and Uzerflow:

```typescript
import { api } from '@/lib/api/client';

// Works the same in dev (mock) and prod (Uzerflow)
const orders = await api.orders.list();
const user = await api.auth.login({ email, password });
const price = await api.products.calculatePrice(config);
```

## 🔄 Order Flow

1. **Upload** → User uploads photo
2. **Style** → AI transforms photo (Replicate API)
3. **Customize** → Select size, paper, frame
4. **Checkout** → Payment via Stripe
5. **Fulfill** → Admin prints and ships

## 📦 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

## 🔗 Related Documents

- [PRD (Product Requirements)](./docs/Footprint-PRD.docx)
- [User Stories & Epics](./docs/Footprint-User-Stories.docx)
- [Architecture Document](./docs/Footprint-Architecture.docx)

## 📄 License

Proprietary - All rights reserved.

---

Built with ❤️ for Footprint
