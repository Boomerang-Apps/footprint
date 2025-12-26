/**
 * Dev Progress Dashboard Data
 *
 * This file contains all sprint, feature, and story data for the development dashboard.
 * Stories are synced with Linear - update linearId to match your Linear issues.
 *
 * Status values: 'done' | 'in-review' | 'in-progress' | 'blocked' | 'backlog' | 'not-created'
 */

// =============================================================================
// DASHBOARD CONFIGURATION - UPDATE FOR YOUR PROJECT
// =============================================================================

export const dashboardConfig = {
  name: 'Footprint',
  title: 'Footprint Dev Dashboard',
  subtitle: 'AI-Powered Photo Printing Studio',
  linearWorkspace: 'boomerang-apps',
  linearProjectId: 'footprint-project-id',
  linearProjectUrl: 'https://linear.app/boomerang-apps/project/footprint',
};

export type StoryStatus = 'done' | 'in-review' | 'in-progress' | 'blocked' | 'backlog' | 'not-created';

export interface Story {
  id: string;           // Internal ID (e.g., UP-01)
  linearId?: string;    // Linear issue ID (e.g., UZF-1818)
  linearUuid?: string;  // Linear UUID for API
  title: string;
  description?: string;
  status: StoryStatus;
  agent?: string;       // Assigned agent
  points?: number;
  blockedBy?: string[]; // IDs of blocking stories
  component?: string;   // Component category
}

export interface Feature {
  id: string;           // Feature ID (e.g., F1)
  name: string;
  description: string;
  prdRef?: string;      // PRD reference
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  stories: Story[];
}

export interface Sprint {
  id: number;
  name: string;
  focus: string;
  status: 'completed' | 'active' | 'planned';
  startDate?: string;
  endDate?: string;
  features: string[];   // Feature IDs in this sprint
}

// =============================================================================
// STORIES DATABASE
// =============================================================================

export const stories: Record<string, Story> = {
  // Sprint 0 - Infrastructure (Completed)
  'INF-01': {
    id: 'INF-01',
    title: 'Project Setup & Next.js Scaffold',
    description: 'Initialize Next.js 14 project with TypeScript, Tailwind, and design tokens',
    status: 'done',
    agent: 'Frontend-A',
    points: 2,
    component: 'Setup',
  },
  'INF-02': {
    id: 'INF-02',
    title: 'Zustand Order Store',
    description: 'State management for 5-step order flow with persistence',
    status: 'done',
    agent: 'Backend-1',
    points: 3,
    component: 'State',
  },
  'INF-03': {
    id: 'INF-03',
    title: 'API Abstraction Layer',
    description: 'Mock/production API switching for development flexibility',
    status: 'done',
    agent: 'Backend-2',
    points: 2,
    component: 'API',
  },
  'INF-04': {
    id: 'INF-04',
    title: 'Supabase Setup',
    description: 'Database client configuration and schema',
    status: 'done',
    agent: 'Backend-1',
    points: 2,
    component: 'Database',
  },
  'INF-05': {
    id: 'INF-05',
    title: '5-Step Order Flow Pages',
    description: 'Create page scaffolding for upload, style, customize, checkout, complete',
    status: 'done',
    agent: 'Frontend-B',
    points: 3,
    component: 'Pages',
  },
  'INF-06': {
    id: 'INF-06',
    title: 'Landing Page',
    description: 'Hero section, features grid, and CTA components',
    status: 'done',
    agent: 'Frontend-A',
    points: 3,
    component: 'Pages',
  },
  'INF-07': {
    id: 'INF-07',
    title: 'DNS & Domain Setup',
    description: 'Vercel DNS configuration and Google Workspace verification',
    status: 'done',
    agent: 'CTO',
    points: 1,
    component: 'Infrastructure',
  },

  // Sprint 1 - Photo Upload
  'UP-01': {
    id: 'UP-01',
    linearId: 'UZF-1825',
    title: 'Upload Photo from Camera Roll',
    description: 'Camera roll opens on mobile devices, JPG/PNG/HEIC support, preview shown',
    status: 'done',
    agent: 'Frontend-B',
    points: 5,
    component: 'Upload',
  },
  'UP-02': {
    id: 'UP-02',
    linearId: 'UZF-1826',
    title: 'Drag-and-Drop Upload on Desktop',
    description: 'Drop zone visible and responsive, multi-file support, progress indicator',
    status: 'done',
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UP-01'],
    component: 'Upload',
  },
  'UP-03': {
    id: 'UP-03',
    linearId: 'UZF-1827',
    title: 'Auto-Optimize Photo for Print',
    description: 'Resize to 300 DPI, color profile conversion, 20MB max, compression',
    status: 'done',
    agent: 'Backend-2',
    points: 5,
    component: 'ImageProcessing',
  },
  'UP-04': {
    id: 'UP-04',
    linearId: 'UZF-1828',
    title: 'Preview Uploaded Photo',
    description: 'Full-size preview display, zoom/pan capability, replace photo option',
    status: 'done',
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UP-01'],
    component: 'Upload',
  },
  'UP-05': {
    id: 'UP-05',
    title: 'Face Detection Cropping',
    description: 'Auto-detect face in photo, smart crop suggestions, manual override',
    status: 'in-progress',  // 🚀 Assigned to Backend-2 2025-12-26
    agent: 'Backend-2',
    points: 2,
    component: 'Upload',
  },

  // Sprint 2 - AI Style (ACTIVE)
  'AI-01': {
    id: 'AI-01',
    linearId: 'UZF-1831',
    title: 'Display AI Style Gallery',
    description: 'Gallery visible with thumbnails and style names',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UP-01', 'UP-04'],
    component: 'StylePicker',
  },
  'AI-02': {
    id: 'AI-02',
    linearId: 'UZF-1832',
    title: 'Preview Photo in Different Styles',
    description: 'Click to preview, loading indicator, < 10 seconds transformation',
    status: 'done',  // ✅ Merged 2025-12-23 (163 tests, 85.98% coverage)
    agent: 'Backend-2',
    points: 8,
    blockedBy: ['UP-03'],
    component: 'AI',
  },
  'AI-03': {
    id: 'AI-03',
    linearId: 'UZF-1833',
    title: 'Keep Original Photo Option',
    description: 'Original in gallery with enhancement toggle',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 2,
    component: 'StylePicker',
  },
  'AI-04': {
    id: 'AI-04',
    linearId: 'UZF-1834',
    title: 'Unlimited Free Style Previews',
    description: 'No paywall, watermark on preview, full quality on purchase',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 3,
    component: 'StylePicker',
  },

  // Sprint 2 - Product Config (ACTIVE)
  'PC-01': {
    id: 'PC-01',
    linearId: 'UZF-1835',
    title: 'Select Print Size',
    description: 'A5/A4/A3/A2 options, size visualization, live price update',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 3,
    component: 'ProductConfig',
  },
  'PC-02': {
    id: 'PC-02',
    linearId: 'UZF-1836',
    title: 'Choose Paper Type',
    description: 'Matte/Glossy/Canvas options, tooltips, price difference shown',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 2,
    component: 'ProductConfig',
  },
  'PC-03': {
    id: 'PC-03',
    linearId: 'UZF-1837',
    title: 'Add Frame Option',
    description: 'None/Black/White/Oak, frame preview, price update',
    status: 'done',  // ✅ Merged 2025-12-23
    agent: 'Frontend-B',
    points: 3,
    component: 'ProductConfig',
  },
  'PC-04': {
    id: 'PC-04',
    linearId: 'UZF-1838',
    title: 'Real-time Price Calculation',
    description: 'Live calculation, breakdown visible, shipping estimate',
    status: 'done',  // ✅ Merged 2025-12-23 (127 tests, 100% coverage)
    agent: 'Backend-1',
    points: 3,
    blockedBy: ['PC-01', 'PC-02', 'PC-03'],
    component: 'Pricing',
  },
  'PC-05': {
    id: 'PC-05',
    title: 'Realistic Mockup Preview',
    description: 'Room environment preview, wall visualization, size context',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (26 tests)
    agent: 'Frontend-B',
    points: 2,
    component: 'ProductConfig',
  },

  // Sprint 3 - Gift (ACTIVE)
  'GF-01': {
    id: 'GF-01',
    linearId: 'UZF-1839',
    title: 'Mark Order as Gift',
    description: 'Gift toggle prominent, gift wrap option, no price on slip',
    status: 'done',  // ✅ QA Approved & Merged - 20 tests, 100% statements
    agent: 'Frontend-B',
    points: 2,
    component: 'Gift',
  },
  'GF-02': {
    id: 'GF-02',
    linearId: 'UZF-1840',
    title: 'Add Personal Message',
    description: '150 char limit, preview shown, printed on card',
    status: 'done',  // ✅ QA Approved & Merged - 25 tests, 100% coverage
    agent: 'Frontend-B',
    points: 3,
    component: 'Gift',
  },
  'GF-03': {
    id: 'GF-03',
    linearId: 'UZF-1841',
    title: 'Ship to Recipient',
    description: 'Separate address form, recipient name, delivery estimate',
    status: 'done',  // ✅ QA Approved & Merged - 51 tests, 100% coverage
    agent: 'Backend-1',
    points: 3,
    component: 'Gift',
  },
  'GF-04': {
    id: 'GF-04',
    title: 'Gift Wrapping Option',
    description: 'Premium gift wrap selection, gift box preview, price addon',
    status: 'in-progress',  // 🚀 Assigned to Frontend-B 2025-12-26
    agent: 'Frontend-B',
    points: 2,
    component: 'Gift',
  },
  'GF-05': {
    id: 'GF-05',
    title: 'Scheduled Delivery Date',
    description: 'Date picker for delivery, arrive by date, calendar integration',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (75 tests, 100% coverage)
    agent: 'Backend-1',
    points: 3,
    component: 'Gift',
  },

  // Sprint 3 - Checkout (ACTIVE)
  'CO-01': {
    id: 'CO-01',
    linearId: 'UZF-1842',
    title: 'Enter Shipping Address',
    description: 'Autocomplete, save for future, validation',
    status: 'done',  // ✅ QA Approved & Merged - 31 tests, 97.61% coverage - SPRINT 3 COMPLETE!
    agent: 'Frontend-B',
    points: 3,
    component: 'Checkout',
  },
  'CO-02': {
    id: 'CO-02',
    linearId: 'UZF-1843',
    title: 'Pay with Credit Card (PayPlus)',
    description: 'PayPlus Checkout integration, Bit support, Israeli cards',
    status: 'done',  // ✅ Merged 2025-12-23 (204 tests, 88.13% coverage)
    agent: 'Backend-2',
    points: 5,
    component: 'Payment',
  },
  'CO-03': {
    id: 'CO-03',
    linearId: 'UZF-1850',
    title: 'Apple Pay / Google Pay',
    description: 'Wallet detection, one-tap payment, same confirmation',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (35 tests, 100% stmt, 90.9% branch)
    agent: 'Backend-2',
    points: 3,
    component: 'Payment',
  },
  'CO-04': {
    id: 'CO-04',
    linearId: 'UZF-1844',
    title: 'Order Confirmation',
    description: 'Email sent, order number shown, WhatsApp option',
    status: 'done',  // ✅ QA Approved & Merged - 229 tests, 87.93% coverage
    agent: 'Backend-2',
    points: 2,
    component: 'Checkout',
  },
  'CO-05': {
    id: 'CO-05',
    linearId: 'UZF-1851',
    title: 'Apply Discount Codes',
    description: 'Code input, validation feedback, discount shown',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (148 tests, 100% coverage on discounts.ts)
    agent: 'Backend-1',
    points: 2,
    component: 'Checkout',
  },
  'CO-06': {
    id: 'CO-06',
    linearId: 'UZF-1853',
    title: 'PayPlus Israeli Payment Integration',
    description: 'Bit support, Israeli cards, installments (תשלומים)',
    status: 'backlog',
    agent: 'Backend-2',
    points: 5,
    blockedBy: ['CO-02'],
    component: 'Payment',
  },

  // Sprint 4 - Admin (ACTIVE)
  'OM-01': {
    id: 'OM-01',
    linearId: 'UZF-1845',
    title: 'Admin Order Dashboard',
    description: 'Order list, filter by status, search by order number',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (38 tests)
    agent: 'Frontend-B',
    points: 3,
    component: 'Admin',
  },
  'OM-02': {
    id: 'OM-02',
    linearId: 'UZF-1846',
    title: 'Update Order Status',
    description: 'Status dropdown, timestamp logged, customer notified',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (50 tests, 100% coverage)
    agent: 'Backend-2',
    points: 2,
    component: 'Admin',
  },
  'OM-03': {
    id: 'OM-03',
    linearId: 'UZF-1847',
    title: 'Download Print-Ready Files',
    description: 'High-res download, correct dimensions, color profile',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (28 tests, 93.75% coverage)
    agent: 'Backend-2',
    points: 2,
    component: 'Admin',
  },
  'OM-04': {
    id: 'OM-04',
    linearId: 'UZF-1848',
    title: 'Add Tracking Numbers',
    description: 'Tracking input, carrier selection, auto-notify',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (48 tests, 96.66% coverage)
    agent: 'Backend-2',
    points: 2,
    component: 'Admin',
  },
  'AI-05': {
    id: 'AI-05',
    linearId: 'UZF-1849',
    title: 'Fast AI Transformation',
    description: 'Target < 10 seconds, progress shown, retry on failure',
    status: 'backlog',
    agent: 'Backend-2',
    points: 5,
    component: 'AI',
  },

  // User Account
  'UA-01': {
    id: 'UA-01',
    title: 'Order History Page',
    description: 'List of past orders, status badges, reorder option',
    status: 'backlog',
    agent: 'Frontend-A',  // 🔄 CTO Reassigned 2025-12-26 (Auth + Standalone Pages domain)
    points: 3,
    component: 'UserAccount',
  },
  'UA-02': {
    id: 'UA-02',
    title: 'Order Detail Page',
    description: 'Full order details, tracking timeline, download files',
    status: 'backlog',
    agent: 'Frontend-B',
    points: 3,
    component: 'UserAccount',
  },

  // Authentication
  'AUTH-01': {
    id: 'AUTH-01',
    title: 'User Login Page',
    description: 'Email/password login, social login options, Hebrew RTL',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (39 tests, 100% coverage)
    agent: 'Frontend-A',
    points: 3,
    component: 'Auth',
  },
  'AUTH-02': {
    id: 'AUTH-02',
    title: 'Guest Checkout Option',
    description: 'Purchase without account, email capture, optional signup',
    status: 'in-progress',  // 🚀 Assigned to Frontend-A 2025-12-26
    agent: 'Frontend-A',  // 🔄 CTO Reassigned 2025-12-26 (Auth domain)
    points: 2,
    component: 'Auth',
  },

  // UI Implementation - Mockup Screens (Sprint 4)
  // REORGANIZED: Parallel tracks for Frontend-A (primitives) and Frontend-B (pages)

  // === FRONTEND-A TRACK: UI Primitives ===
  'UI-07': {
    id: 'UI-07',
    title: 'Base UI Primitives (components/ui/)',
    description: 'Create foundational UI components: Button, Card, Input, Select, Checkbox, Badge. RTL-ready with Tailwind.',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (134 tests, 100% coverage)
    agent: 'Frontend-A',
    points: 3,
    component: 'UI',
  },
  'UI-08': {
    id: 'UI-08',
    title: 'Step Progress Indicator',
    description: 'Create reusable 5-step progress indicator for order flow. Shows current step, completed steps, Hebrew labels.',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (29 tests, 100% coverage)
    agent: 'Frontend-A',
    points: 2,
    blockedBy: ['UI-07'],
    component: 'UI',
  },
  'UI-09': {
    id: 'UI-09',
    title: 'Price Display & Timeline Components',
    description: 'PriceDisplay (ILS formatting with ₪), OrderTimeline (4-step order status tracker). Shared by multiple pages.',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (62 tests, 100% coverage)
    agent: 'Frontend-A',
    points: 2,
    blockedBy: ['UI-07'],
    component: 'UI',
  },

  // === FRONTEND-B TRACK: Feature Pages ===
  'UI-06': {
    id: 'UI-06',
    title: 'Demo Data & Mock Images',
    description: 'Create mock data for orders, users, sample images for style previews. Foundation for UI testing.',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-24 (51 tests, 100% coverage)
    agent: 'Frontend-B',
    points: 2,
    component: 'UI',
  },
  'UI-01': {
    id: 'UI-01',
    title: 'Upload Page UI (01-upload.html)',
    description: 'Implement upload mockup: drag-drop zone, camera button, progress states, Hebrew RTL',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-24 (24 tests)
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UI-06'],
    component: 'UI',
  },
  'UI-02': {
    id: 'UI-02',
    title: 'Style Selection UI (02-style-selection.html)',
    description: 'Implement style picker: 8 AI styles gallery, before/after preview, loading states',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (28 tests, 100% coverage)
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UI-06'],
    component: 'UI',
  },
  'UI-03': {
    id: 'UI-03',
    title: 'Customize Page UI (03-customize.html)',
    description: 'Implement product config: size/paper/frame selectors, live price, mockup preview',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (35 tests, 100% coverage)
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UI-06'],  // Can start in parallel after demo data
    component: 'UI',
  },
  'UI-04': {
    id: 'UI-04',
    title: 'Checkout Page UI (04-checkout.html)',
    description: 'Implement checkout: gift toggle, address form, payment section, price breakdown',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-25 (57 tests)
    agent: 'Frontend-B',
    points: 5,
    blockedBy: ['UI-06'],
    component: 'UI',
  },
  'UI-05': {
    id: 'UI-05',
    title: 'Confirmation Page UI (05-confirmation.html)',
    description: 'Implement confirmation: order summary, timeline tracker, WhatsApp share',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (45 tests)
    agent: 'Frontend-B',
    points: 2,
    blockedBy: ['UI-06', 'UI-09'],  // Needs Timeline component from Frontend-A
    component: 'UI',
  },

  // =============================================================================
  // INTEGRATION - Connect UI to Backend APIs (Sprint 5)
  // =============================================================================

  'INT-01': {
    id: 'INT-01',
    title: 'Connect Upload to R2 Storage',
    description: 'Call /api/upload on image select, store R2 URL in orderStore, show upload progress',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (35 tests, 84.41% coverage)
    agent: 'Frontend-B',
    points: 3,
    blockedBy: ['UI-01', 'UP-03'],
    component: 'Integration',
  },
  'INT-02': {
    id: 'INT-02',
    title: 'Connect Style Selection to AI Transform',
    description: 'Call /api/transform when style selected, show real AI preview instead of simulated, handle errors',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (39 tests, 100% stmt coverage)
    agent: 'Frontend-B',
    points: 5,
    blockedBy: ['UI-02', 'AI-02', 'INT-01'],
    component: 'Integration',
  },
  'INT-03': {
    id: 'INT-03',
    title: 'Connect Checkout to Payment APIs',
    description: 'Integrate PayPlus (Israeli) and Stripe (wallet) payment flows, handle success/failure callbacks',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (20 tests, 95.52% coverage)
    agent: 'Frontend-B',
    points: 5,
    blockedBy: ['UI-04', 'CO-02', 'CO-03'],
    component: 'Integration',
  },
  'INT-04': {
    id: 'INT-04',
    title: 'Create Order on Payment Success',
    description: 'Create order record in database on successful payment, trigger confirmation email via /api/orders/[id]/confirm',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (19 tests, 97.43% coverage)
    agent: 'Backend-2',
    points: 3,
    blockedBy: ['INT-03', 'CO-04'],
    component: 'Integration',
  },
  'INT-05': {
    id: 'INT-05',
    title: 'Connect Confirmation to Order API',
    description: 'Fetch real order data from API, display order number, tracking info, WhatsApp share with real data',
    status: 'done',  // ✅ QA Approved & Merged 2025-12-26 (54 tests, 94.04% coverage) - SPRINT 5 COMPLETE!
    agent: 'Frontend-B',
    points: 2,
    blockedBy: ['UI-05', 'INT-04'],
    component: 'Integration',
  },
};

// =============================================================================
// FEATURES
// =============================================================================

export const features: Record<string, Feature> = {
  'F0': {
    id: 'F0',
    name: 'Infrastructure',
    description: 'Project setup, configuration, and foundation code',
    prdRef: 'CLAUDE.md - Technology Stack',
    priority: 'P0',
    stories: [
      stories['INF-01'],
      stories['INF-02'],
      stories['INF-03'],
      stories['INF-04'],
      stories['INF-05'],
      stories['INF-06'],
      stories['INF-07'],
    ],
  },
  'F1': {
    id: 'F1',
    name: 'Photo Upload',
    description: 'Upload photos from camera roll or drag-and-drop with optimization',
    prdRef: 'CLAUDE.md - Epic 1',
    priority: 'P0',
    stories: [
      stories['UP-01'],
      stories['UP-02'],
      stories['UP-03'],
      stories['UP-04'],
      stories['UP-05'],
    ],
  },
  'F2': {
    id: 'F2',
    name: 'AI Style Transformation',
    description: 'Apply AI styles to photos (pop art, watercolor, etc.)',
    prdRef: 'CLAUDE.md - Epic 2',
    priority: 'P0',
    stories: [
      stories['AI-01'],
      stories['AI-02'],
      stories['AI-03'],
      stories['AI-04'],
    ],
  },
  'F3': {
    id: 'F3',
    name: 'Product Configuration',
    description: 'Size, paper type, frame selection with live pricing',
    prdRef: 'CLAUDE.md - Epic 3',
    priority: 'P0',
    stories: [
      stories['PC-01'],
      stories['PC-02'],
      stories['PC-03'],
      stories['PC-04'],
      stories['PC-05'],
    ],
  },
  'F4': {
    id: 'F4',
    name: 'Gift Experience',
    description: 'Gift wrapping, messages, and recipient shipping',
    prdRef: 'CLAUDE.md - Epic 4',
    priority: 'P1',
    stories: [
      stories['GF-01'],
      stories['GF-02'],
      stories['GF-03'],
      stories['GF-04'],
      stories['GF-05'],
    ],
  },
  'F5': {
    id: 'F5',
    name: 'Checkout (Sprint 3)',
    description: 'Core checkout: address, payment, confirmation',
    prdRef: 'CLAUDE.md - Epic 5',
    priority: 'P0',
    stories: [
      stories['CO-01'],
      stories['CO-02'],
      stories['CO-04'],
    ],
  },
  'F5b': {
    id: 'F5b',
    name: 'Payment Polish (Sprint 4)',
    description: 'Additional payment methods and discount codes',
    prdRef: 'CLAUDE.md - Epic 5',
    priority: 'P1',
    stories: [
      stories['CO-03'],
      stories['CO-05'],
      stories['CO-06'],
    ],
  },
  'F6': {
    id: 'F6',
    name: 'Admin Dashboard',
    description: 'Order management, fulfillment, and tracking',
    prdRef: 'CLAUDE.md - Epic 6',
    priority: 'P1',
    stories: [
      stories['OM-01'],
      stories['OM-02'],
      stories['OM-03'],
      stories['OM-04'],
      stories['AI-05'],
    ],
  },
  'F7': {
    id: 'F7',
    name: 'User Account',
    description: 'Order history, order details, user profile',
    prdRef: 'Mockups: 07-order-history.html, 08-order-detail.html',
    priority: 'P2',
    stories: [
      stories['UA-01'],
      stories['UA-02'],
    ],
  },
  'F8': {
    id: 'F8',
    name: 'Authentication',
    description: 'User login, registration, and guest checkout',
    prdRef: 'Mockups: 11-login.html',
    priority: 'P2',
    stories: [
      stories['AUTH-01'],
      stories['AUTH-02'],
    ],
  },
  'F9': {
    id: 'F9',
    name: 'UI Implementation (Order Flow)',
    description: 'Implement mockup screens 01-05 with demo data. Frontend-B track.',
    prdRef: 'design_mockups/01-05, .claudecode/milestones/SPRINT-4-UI-PLAN.md',
    priority: 'P0',
    stories: [
      stories['UI-06'],  // Foundation - demo data
      stories['UI-01'],  // Upload page
      stories['UI-02'],  // Style selection
      stories['UI-03'],  // Customize
      stories['UI-04'],  // Checkout
      stories['UI-05'],  // Confirmation
    ],
  },
  'F10': {
    id: 'F10',
    name: 'UI Primitives (Shared Components)',
    description: 'Base UI components and shared primitives. Frontend-A track - runs parallel to F9.',
    prdRef: 'components/ui/, CLAUDE.md - Components',
    priority: 'P0',
    stories: [
      stories['UI-07'],  // Base primitives: Button, Card, Input
      stories['UI-08'],  // Step progress indicator
      stories['UI-09'],  // Price display & timeline
    ],
  },
  'F11': {
    id: 'F11',
    name: 'End-to-End Integration',
    description: 'Connect UI screens to backend APIs for full order flow. Upload→R2, Style→AI, Checkout→Payment, Confirm→Order.',
    prdRef: 'Sprint 5 Integration',
    priority: 'P0',
    stories: [
      stories['INT-01'],  // Upload → R2
      stories['INT-02'],  // Style → AI Transform
      stories['INT-03'],  // Checkout → Payment
      stories['INT-04'],  // Payment → Order Creation
      stories['INT-05'],  // Confirm → Order API
    ],
  },
};

// =============================================================================
// SPRINTS
// =============================================================================

export const sprints: Sprint[] = [
  {
    id: 0,
    name: 'Sprint 0',
    focus: 'Infrastructure & Setup',
    status: 'completed',
    features: ['F0'],
  },
  {
    id: 1,
    name: 'Sprint 1',
    focus: 'Foundation & Photo Upload',
    status: 'completed',  // ✅ COMPLETED 2025-12-22
    features: ['F1'],
  },
  {
    id: 2,
    name: 'Sprint 2',
    focus: 'AI & Customization',
    status: 'completed',  // ✅ COMPLETED 2025-12-23
    features: ['F2', 'F3'],
  },
  {
    id: 3,
    name: 'Sprint 3',
    focus: 'Checkout & Gifting',
    status: 'completed',  // ✅ COMPLETED 2025-12-23 - All 6 stories merged (18 SP)
    features: ['F4', 'F5'],
  },
  {
    id: 4,
    name: 'Sprint 4',
    focus: 'Admin, Payment & UI Polish',
    status: 'completed',  // ✅ COMPLETED 2025-12-26 - OM-04 merged! 100% (34/34 SP)
    features: ['F5b', 'F6', 'F9', 'F10'],  // Combined: Admin + Payment + UI Implementation
  },
  {
    id: 5,
    name: 'Sprint 5',
    focus: 'End-to-End Integration',
    status: 'active',  // 🚀 STARTED 2025-12-26 - Connect UI to Backend APIs
    features: ['F11'],  // Priority: Full order flow integration (18 SP)
  },
  {
    id: 6,
    name: 'Sprint 6',
    focus: 'User Accounts & Auth',
    status: 'planned',
    features: ['F7', 'F8'],  // User account features, login (11 SP)
  },
];

// =============================================================================
// COMPONENTS (for grouping by component type)
// =============================================================================

export const components = [
  'Setup',
  'State',
  'API',
  'Database',
  'Pages',
  'Infrastructure',
  'Upload',
  'ImageProcessing',
  'StylePicker',
  'AI',
  'ProductConfig',
  'Pricing',
  'Gift',
  'Checkout',
  'Payment',
  'Admin',
  'UserAccount',
  'Auth',
  'UI',
  'Integration',
] as const;

export type ComponentType = typeof components[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getStoriesByComponent(component: string): Story[] {
  return Object.values(stories).filter(s => s.component === component);
}

export function getStoriesBySprint(sprintId: number): Story[] {
  const sprint = sprints.find(s => s.id === sprintId);
  if (!sprint) return [];

  const sprintStories: Story[] = [];
  sprint.features.forEach(featureId => {
    const feature = features[featureId];
    if (feature) {
      sprintStories.push(...feature.stories);
    }
  });
  return sprintStories;
}

export function getSprintProgress(sprintId: number): { done: number; total: number; percentage: number } {
  const sprintStories = getStoriesBySprint(sprintId);
  const done = sprintStories.filter(s => s.status === 'done').length;
  const total = sprintStories.length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percentage };
}

export function getFeatureProgress(featureId: string): { done: number; total: number; percentage: number } {
  const feature = features[featureId];
  if (!feature) return { done: 0, total: 0, percentage: 0 };

  const done = feature.stories.filter(s => s.status === 'done').length;
  const total = feature.stories.length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percentage };
}

export function getOverallProgress(): { done: number; total: number; percentage: number } {
  const allStories = Object.values(stories);
  const done = allStories.filter(s => s.status === 'done').length;
  const total = allStories.length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percentage };
}

// =============================================================================
// PAGES (for Pages tab with links)
// =============================================================================

export interface Page {
  id: string;
  name: string;
  nameHe: string;          // Hebrew name
  route: string;           // App route
  mockup?: string;         // Mockup file reference
  storyId?: string;        // Related story ID
  status: 'implemented' | 'in-progress' | 'not-started';
  description: string;
}

export const pages: Page[] = [
  // Order Flow (5-step)
  {
    id: 'create',
    name: 'Upload Photo',
    nameHe: 'העלאת תמונה',
    route: '/create',
    mockup: '01-upload.html',
    storyId: 'UI-01',
    status: 'not-started',
    description: 'Step 1: Upload photo from camera or drag-drop',
  },
  {
    id: 'style',
    name: 'Choose Style',
    nameHe: 'בחירת סגנון',
    route: '/create/style',
    mockup: '02-style-selection.html',
    storyId: 'UI-02',
    status: 'not-started',
    description: 'Step 2: Select AI art style transformation',
  },
  {
    id: 'customize',
    name: 'Customize Print',
    nameHe: 'התאמה אישית',
    route: '/create/customize',
    mockup: '03-customize.html',
    storyId: 'UI-03',
    status: 'not-started',
    description: 'Step 3: Choose size, paper, and frame options',
  },
  {
    id: 'checkout',
    name: 'Checkout',
    nameHe: 'תשלום',
    route: '/create/checkout',
    mockup: '04-checkout.html',
    storyId: 'UI-04',
    status: 'not-started',
    description: 'Step 4: Enter shipping, gift options, and pay',
  },
  {
    id: 'complete',
    name: 'Order Complete',
    nameHe: 'הזמנה הושלמה',
    route: '/create/complete',
    mockup: '05-confirmation.html',
    storyId: 'UI-05',
    status: 'not-started',
    description: 'Step 5: Confirmation with order tracking',
  },
  // Marketing
  {
    id: 'landing',
    name: 'Landing Page',
    nameHe: 'דף נחיתה',
    route: '/',
    mockup: '06-landing.html',
    storyId: 'INF-06',
    status: 'implemented',
    description: 'Marketing homepage with hero upload',
  },
  // User Account
  {
    id: 'order-history',
    name: 'Order History',
    nameHe: 'היסטוריית הזמנות',
    route: '/account/orders',
    mockup: '07-order-history.html',
    storyId: 'UA-01',
    status: 'not-started',
    description: 'User order history list',
  },
  {
    id: 'order-detail',
    name: 'Order Detail',
    nameHe: 'פרטי הזמנה',
    route: '/account/orders/[id]',
    mockup: '08-order-detail.html',
    storyId: 'UA-02',
    status: 'not-started',
    description: 'Single order details and tracking',
  },
  // Admin
  {
    id: 'admin-orders',
    name: 'Admin Orders',
    nameHe: 'ניהול הזמנות',
    route: '/admin/orders',
    mockup: '09-admin-orders.html',
    storyId: 'OM-01',
    status: 'not-started',
    description: 'Admin order management dashboard',
  },
  {
    id: 'admin-order-detail',
    name: 'Admin Order Detail',
    nameHe: 'פרטי הזמנה (אדמין)',
    route: '/admin/orders/[id]',
    mockup: '10-admin-order-detail.html',
    storyId: 'OM-02',
    status: 'not-started',
    description: 'Admin view of single order with actions',
  },
  // Auth
  {
    id: 'login',
    name: 'Login',
    nameHe: 'התחברות',
    route: '/login',
    mockup: '11-login.html',
    storyId: 'AUTH-01',
    status: 'not-started',
    description: 'User login and registration',
  },
  // Dev Tools
  {
    id: 'dev-dashboard',
    name: 'Dev Dashboard',
    nameHe: 'לוח פיתוח',
    route: '/dev-dashboard',
    status: 'implemented',
    description: 'Development progress tracking (this page)',
  },
];

export const pageGroups = [
  { id: 'order-flow', name: 'Order Flow', icon: '🛒', pageIds: ['create', 'style', 'customize', 'checkout', 'complete'] },
  { id: 'marketing', name: 'Marketing', icon: '📢', pageIds: ['landing'] },
  { id: 'user-account', name: 'User Account', icon: '👤', pageIds: ['order-history', 'order-detail'] },
  { id: 'admin', name: 'Admin', icon: '⚙️', pageIds: ['admin-orders', 'admin-order-detail'] },
  { id: 'auth', name: 'Authentication', icon: '🔐', pageIds: ['login'] },
  { id: 'dev', name: 'Dev Tools', icon: '🛠️', pageIds: ['dev-dashboard'] },
];

export const statusConfig: Record<StoryStatus, { label: string; color: string; bgColor: string }> = {
  'done': { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
  'in-review': { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'blocked': { label: 'Blocked', color: 'text-red-700', bgColor: 'bg-red-100' },
  'backlog': { label: 'Backlog', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'not-created': { label: 'Not Created', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export const agentConfig: Record<string, { label: string; color: string }> = {
  'CTO': { label: 'CTO', color: 'text-red-600' },
  'PM': { label: 'PM', color: 'text-purple-600' },
  'QA': { label: 'QA', color: 'text-teal-600' },
  'Frontend-A': { label: 'Frontend-A', color: 'text-purple-600' },
  'Frontend-B': { label: 'Frontend-B', color: 'text-indigo-600' },
  'Backend-1': { label: 'Backend-1', color: 'text-orange-600' },
  'Backend-2': { label: 'Backend-2', color: 'text-pink-600' },
};

// =============================================================================
// UI PAGES (for Pages tab)
// =============================================================================

export interface UIPage {
  name: string;
  route: string;
  status: 'done' | 'planned';
  description?: string;
}

export interface UIPageCategory {
  category: string;
  icon: string;
  pages: UIPage[];
}

export const uiPages: UIPageCategory[] = [
  {
    category: 'Public',
    icon: '🌐',
    pages: [
      { name: 'Landing Page', route: '/', status: 'done', description: 'Hero, products, testimonials' },
    ],
  },
  {
    category: 'Order Flow',
    icon: '🛒',
    pages: [
      { name: 'Step 1 - Upload', route: '/create', status: 'done', description: 'Photo upload from camera roll or drag-drop' },
      { name: 'Step 2 - Style', route: '/create/style', status: 'done', description: 'AI style selection gallery' },
      { name: 'Step 3 - Customize', route: '/create/customize', status: 'done', description: 'Size, paper, frame selection' },
      { name: 'Step 4 - Checkout', route: '/create/checkout', status: 'done', description: 'Address and payment' },
      { name: 'Step 5 - Complete', route: '/create/complete', status: 'done', description: 'Order confirmation' },
    ],
  },
  {
    category: 'Admin',
    icon: '⚙️',
    pages: [
      { name: 'Order Dashboard', route: '/admin', status: 'done', description: 'Order list with filters (OM-01)' },
      { name: 'Order Status API', route: '/api/admin/orders/[id]/status', status: 'done', description: 'Status update endpoint (OM-02)' },
    ],
  },
  {
    category: 'Dev Tools',
    icon: '🔧',
    pages: [
      { name: 'Cockpit', route: '/cockpit', status: 'done', description: 'PM dashboard' },
    ],
  },
];

// =============================================================================
// AGENTS (for Agents tab)
// =============================================================================

export interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  worktree: string;
  branch: string;
  status: 'active' | 'offline' | 'standby';
  stories: string[];
  color: string;
}

export const agents: Agent[] = [
  {
    id: 'pm',
    name: 'PM Agent',
    model: 'Opus 4.5',
    role: 'Orchestration',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/agent-pm',
    branch: 'agent/agent-pm',
    status: 'active',
    stories: [],
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'cto',
    name: 'CTO Agent',
    model: 'Opus 4.5',
    role: 'Architecture, Security',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/agent-cto',
    branch: 'cto-workspace',
    status: 'offline',
    stories: [],
    color: 'bg-red-100 text-red-800',
  },
  {
    id: 'frontend-a',
    name: 'Frontend-A',
    model: 'Sonnet 4',
    role: 'Layout, Design System',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/frontend-a',
    branch: 'develop',
    status: 'offline',
    stories: [],
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'frontend-b',
    name: 'Frontend-B',
    model: 'Sonnet 4',
    role: 'Features, Components',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/frontend-b',
    branch: 'develop',
    status: 'offline',
    stories: [],
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    id: 'backend-1',
    name: 'Backend-1',
    model: 'Sonnet 4',
    role: 'Database, Auth, State',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/backend-1',
    branch: 'develop',
    status: 'offline',
    stories: [],
    color: 'bg-orange-100 text-orange-800',
  },
  {
    id: 'backend-2',
    name: 'Backend-2',
    model: 'Sonnet 4',
    role: 'API, AI, Storage, Payment',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/backend-2',
    branch: 'develop',
    status: 'offline',
    stories: [],
    color: 'bg-pink-100 text-pink-800',
  },
  {
    id: 'qa',
    name: 'QA Agent',
    model: 'Sonnet 4',
    role: 'Testing, Quality',
    worktree: '/Users/mymac/Desktop/footprint-worktrees/qa',
    branch: 'qa-validation',
    status: 'standby',
    stories: [],
    color: 'bg-teal-100 text-teal-800',
  },
];

// =============================================================================
// EPICS (for Epics tab)
// =============================================================================

export interface Epic {
  id: string;
  name: string;
  description: string;
  features: string[];
  status: 'done' | 'in-progress' | 'planned';
}

export const epics: Epic[] = [
  {
    id: 'EPIC-01',
    name: 'Photo Upload',
    description: 'Upload and process photos for printing',
    features: ['F1'],
    status: 'done',
  },
  {
    id: 'EPIC-02',
    name: 'AI Transformation',
    description: 'Apply AI styles to photos',
    features: ['F2'],
    status: 'done',
  },
  {
    id: 'EPIC-03',
    name: 'Product Configuration',
    description: 'Configure print options',
    features: ['F3'],
    status: 'done',
  },
  {
    id: 'EPIC-04',
    name: 'Checkout & Payment',
    description: 'Payment and order processing',
    features: ['F4', 'F5', 'F5b'],
    status: 'done',
  },
  {
    id: 'EPIC-05',
    name: 'Admin Dashboard',
    description: 'Order management for admins',
    features: ['F6'],
    status: 'done',
  },
  {
    id: 'EPIC-06',
    name: 'UI Implementation',
    description: 'Frontend UI screens',
    features: ['F9', 'F10'],
    status: 'done',
  },
  {
    id: 'EPIC-07',
    name: 'Integration',
    description: 'Connect UI to backend APIs',
    features: ['F11'],
    status: 'in-progress',
  },
];

// =============================================================================
// SCREENS (for Sitemap tab)
// =============================================================================

export interface Screen {
  id: string;
  name: string;
  path: string;
  status: 'done' | 'in-progress' | 'planned';
  category: string;
}

export const screens: Screen[] = [
  { id: 'home', name: 'Home', path: '/', status: 'done', category: 'marketing' },
  { id: 'upload', name: 'Upload', path: '/create', status: 'done', category: 'order-flow' },
  { id: 'style', name: 'Style Selection', path: '/create/style', status: 'done', category: 'order-flow' },
  { id: 'customize', name: 'Customize', path: '/create/customize', status: 'done', category: 'order-flow' },
  { id: 'checkout', name: 'Checkout', path: '/create/checkout', status: 'done', category: 'order-flow' },
  { id: 'complete', name: 'Confirmation', path: '/create/complete', status: 'done', category: 'order-flow' },
  { id: 'admin', name: 'Admin Dashboard', path: '/admin', status: 'done', category: 'admin' },
  { id: 'cockpit', name: 'Dev Cockpit', path: '/cockpit', status: 'done', category: 'dev' },
];

export const screenCategories = [
  { id: 'marketing', name: 'Marketing', screens: screens.filter(s => s.category === 'marketing') },
  { id: 'order-flow', name: 'Order Flow', screens: screens.filter(s => s.category === 'order-flow') },
  { id: 'admin', name: 'Admin', screens: screens.filter(s => s.category === 'admin') },
  { id: 'dev', name: 'Development', screens: screens.filter(s => s.category === 'dev') },
];
