# Footprint Wave Plan

## Overview

Footprint is an Israeli e-commerce platform that transforms photos into AI-generated art prints. This document outlines the development waves and stories for the project.

**Tech Stack:** Next.js 14, React 18, TypeScript, Supabase, Cloudflare R2, Replicate AI, PayPlus

---

## Wave 1: Core User Flow (COMPLETE)

**Status:** ✅ 100% Complete | **Tests:** 446 passing | **Coverage:** 90%+

| Story ID | Title | Domain | Points | Status |
|----------|-------|--------|--------|--------|
| WAVE1-FE-001 | Photo Upload Flow | Frontend | 5 | ✅ Complete |
| WAVE1-FE-002 | Style Selection (9 AI styles) | Frontend | 5 | ✅ Complete |
| WAVE1-FE-003 | Product Customization | Frontend | 5 | ✅ Complete |
| WAVE1-BE-001 | Upload API (R2 integration) | Backend | 5 | ✅ Complete |
| WAVE1-BE-002 | Transform API (Replicate) | Backend | 5 | ✅ Complete |
| WAVE1-INT-001 | PayPlus Payment Integration | Integration | 8 | ✅ Complete |
| WAVE1-SEC-001 | API Security & Rate Limiting | Security | 5 | ✅ Complete |
| WAVE1-QA-001 | TDD & Test Coverage | QA | 3 | ✅ Complete |

**Features Delivered:**
- Gallery/camera/drag-drop photo upload
- 9 AI transformation styles
- Size options: A2, A3, A4, A5
- Paper types: matte, glossy, canvas
- Frame types: none, black, white, oak
- PayPlus checkout integration
- Rate limiting on all endpoints
- Admin authentication layer

---

## Wave 3: Order Management (IN PROGRESS)

**Status:** 🔶 50% Complete | **Tests:** 150 passing

| Story ID | Title | Domain | Points | Status |
|----------|-------|--------|--------|--------|
| UI-04A | Order Details API | Backend | 5 | ✅ Complete |
| BE-03 | Admin Orders List API | Backend | 5 | ✅ Complete |
| UI-04B | Order Tracking Page | Frontend | 5 | ⏳ Pending |
| UI-04C | Order History Page | Frontend | 5 | ⏳ Pending |

**Features:**
- Order details API with items, pricing, addresses
- Admin orders list with filtering, sorting, pagination
- Order tracking page with timeline component
- Order history page with status filters

---

## Wave 4: Customer Account (PLANNED)

**Status:** 📋 Planned | **Points:** 16

| Story ID | Title | Domain | Points | Priority |
|----------|-------|--------|--------|----------|
| UI-05A | User Profile Settings | Frontend | 3 | P1 |
| UI-05B | Saved Addresses Management | Frontend | 5 | P1 |
| BE-04 | User Profile API | Backend | 3 | P1 |
| BE-05 | Addresses CRUD API | Backend | 5 | P1 |

**Features:**
- User profile editing (name, email, phone, avatar)
- Saved shipping/billing addresses
- Default address selection
- Address validation

---

## Wave 5: Payment Expansion (PLANNED)

**Status:** 📋 Planned | **Points:** 21

| Story ID | Title | Domain | Points | Priority |
|----------|-------|--------|--------|----------|
| INT-02 | Apple Pay Integration | Integration | 8 | P1 |
| INT-03 | Google Pay Integration | Integration | 8 | P1 |
| INT-04 | Bit Payment Integration | Integration | 5 | P2 |

**Features:**
- Apple Pay for iOS/Safari users
- Google Pay for Android/Chrome users
- Bit (Israeli payment app) integration

---

## Wave 6: Notifications & Engagement (PLANNED)

**Status:** 📋 Planned | **Points:** 21

| Story ID | Title | Domain | Points | Priority |
|----------|-------|--------|--------|----------|
| BE-06 | Order Status Notifications API | Backend | 5 | P1 |
| INT-05 | WhatsApp Notifications | Integration | 8 | P1 |
| INT-06 | SMS Notifications | Integration | 5 | P2 |
| UI-06A | Notification Preferences | Frontend | 3 | P2 |

**Features:**
- Automated order status notifications
- WhatsApp Business API integration
- SMS via Israeli provider
- User notification preferences

---

## Wave 7: Admin Enhancements (PLANNED)

**Status:** 📋 Planned | **Points:** 24

| Story ID | Title | Domain | Points | Priority |
|----------|-------|--------|--------|----------|
| UI-07A | Admin Fulfillment Dashboard | Frontend | 8 | P1 |
| BE-07 | Bulk Order Operations API | Backend | 5 | P1 |
| BE-08 | Print File Batch Download | Backend | 3 | P2 |
| INT-07 | Shipping Provider Integration | Integration | 8 | P2 |

**Features:**
- Fulfillment workflow dashboard
- Bulk status updates
- Batch print file downloads
- Israel Post / DHL API integration

---

## Wave 8+: Future Features (BACKLOG)

| Feature | Domain | Priority | Notes |
|---------|--------|----------|-------|
| Multi-image Orders | Full-stack | P2 | Multiple photos per order |
| Discount Code Management UI | Admin | P2 | Admin interface for coupons |
| Wishlist/Favorites | Frontend | P3 | Save products for later |
| Reorder from Previous | Frontend | P3 | Quick reorder flow |
| Mobile App | Mobile | P3 | React Native / Expo |
| Background Removal | AI | P3 | Advanced AI feature |
| Image Upscaling | AI | P3 | Enhance low-res photos |
| Scheduled Delivery | Full-stack | P2 | Pick delivery date |
| Gift Recipient Tracking | Full-stack | P2 | Notify gift recipients |
| Analytics Dashboard | Admin | P3 | Sales & conversion metrics |

---

## Database Entities

| Table | Purpose |
|-------|---------|
| profiles | User accounts with admin flag |
| addresses | Shipping/billing addresses |
| orders | Order header with status, pricing |
| order_items | Individual items with style, size, frame |
| payments | Payment records (PayPlus, Stripe, etc.) |
| shipments | Tracking info, carrier, delivery dates |
| discount_codes | Coupon codes and rules |
| order_status_history | Audit log of status changes |
| notifications | Multi-channel notification queue |
| product_prices | Dynamic pricing by size/paper/frame |

---

## Key Metrics

| Metric | Wave 1 | Wave 3 | Target |
|--------|--------|--------|--------|
| Unit Tests | 446 | 150 | 90%+ coverage |
| E2E Tests | 20 | - | All critical paths |
| Story Points | 41 | 20 | - |
| Stories Complete | 8/8 | 2/4 | - |

---

## Notes

- All prices stored in agorot (1/100 ILS) in database
- UI displays prices in ILS (₪)
- RTL (Hebrew) is primary language
- Mobile-first responsive design
- All API endpoints rate-limited via Upstash Redis
