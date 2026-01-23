/**
 * Customize Page Tests
 *
 * TDD Test Suite for UI-03: Customize Page UI
 * Tests the customize page matching 03-customize.html mockup
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomizePage from './page';
import { useOrderStore } from '@/stores/orderStore';

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock zustand store
vi.mock('@/stores/orderStore');

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('CustomizePage', () => {
  const mockSetStep = vi.fn();
  const mockSetSize = vi.fn();
  const mockSetPaperType = vi.fn();
  const mockSetFrameType = vi.fn();
  const mockSetIsGift = vi.fn();
  const mockSetGiftMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      setStep: mockSetStep,
      setSize: mockSetSize,
      setPaperType: mockSetPaperType,
      setFrameType: mockSetFrameType,
      setIsGift: mockSetIsGift,
      setGiftMessage: mockSetGiftMessage,
      originalImage: 'blob:test-image-url',
      transformedImage: null,
      selectedStyle: 'pop_art',
      currentStep: 'customize',
      size: 'A4',
      paperType: 'matte',
      frameType: 'black',
      isGift: false,
      giftMessage: '',
      _hasHydrated: true,
    });
  });

  describe('Page Structure', () => {
    it('renders the page header with title "התאמה אישית"', () => {
      render(<CustomizePage />);
      expect(screen.getByText('התאמה אישית')).toBeInTheDocument();
    });

    it('renders back button in header', () => {
      render(<CustomizePage />);
      const backButtons = screen.getAllByRole('button', { name: /חזרה|back/i });
      expect(backButtons.length).toBeGreaterThan(0);
    });

    it('renders main content wrapper', () => {
      render(<CustomizePage />);
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('renders all 4 progress steps', () => {
      render(<CustomizePage />);
      expect(screen.getByText('העלאה')).toBeInTheDocument();
      expect(screen.getByText('סגנון')).toBeInTheDocument();
      expect(screen.getByText('התאמה')).toBeInTheDocument();
      expect(screen.getByText('תשלום')).toBeInTheDocument();
    });

    it('shows steps 1 and 2 as completed', () => {
      render(<CustomizePage />);
      const uploadStep = screen.getByText('העלאה').closest('[data-step]');
      const styleStep = screen.getByText('סגנון').closest('[data-step]');
      expect(uploadStep).toHaveAttribute('data-completed', 'true');
      expect(styleStep).toHaveAttribute('data-completed', 'true');
    });

    it('shows step 3 as active', () => {
      render(<CustomizePage />);
      const customizeStep = screen.getByText('התאמה').closest('[data-step]');
      expect(customizeStep).toHaveAttribute('data-active', 'true');
    });

    it('shows step 4 of 5 steps (customize is step 4)', () => {
      render(<CustomizePage />);
      // The component has 5 progress steps, verify all are present
      const progressStepsContainer = document.querySelector('[data-step="upload"]')?.parentElement;
      expect(progressStepsContainer).toBeInTheDocument();
      // Verify there are 5 data-step elements
      const stepElements = document.querySelectorAll('[data-step]');
      expect(stepElements.length).toBe(5);
    });
  });

  describe('Preview Container', () => {
    it('renders preview image', () => {
      render(<CustomizePage />);
      const preview = screen.getByAltText(/artwork/i);
      expect(preview).toBeInTheDocument();
    });

    it('renders preview mockup container', () => {
      render(<CustomizePage />);
      const mockupContainer = screen.getByTestId('mockup-container');
      expect(mockupContainer).toBeInTheDocument();
    });

    it('displays current size in art frame', () => {
      render(<CustomizePage />);
      const artFrame = screen.getByTestId('art-frame');
      expect(artFrame).toHaveAttribute('data-size', 'A4');
    });
  });

  describe('Size Selector', () => {
    it('renders size section title "גודל הדפסה"', () => {
      render(<CustomizePage />);
      expect(screen.getByText('גודל הדפסה')).toBeInTheDocument();
    });

    it('renders all 4 size options', () => {
      render(<CustomizePage />);
      expect(screen.getByRole('button', { name: /A5/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /A4/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /A3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /A2/i })).toBeInTheDocument();
    });

    it('shows correct prices for each size', () => {
      render(<CustomizePage />);
      expect(screen.getByText('₪89')).toBeInTheDocument(); // A5
      expect(screen.getByText('₪149')).toBeInTheDocument(); // A4
      expect(screen.getByText('₪249')).toBeInTheDocument(); // A3
      expect(screen.getByText('₪379')).toBeInTheDocument(); // A2
    });

    it('shows "פופולרי" badge on A4', () => {
      render(<CustomizePage />);
      const a4Button = screen.getByRole('button', { name: /A4/i });
      expect(a4Button).toHaveTextContent('פופולרי');
    });

    it('highlights selected size', () => {
      render(<CustomizePage />);
      const a4Button = screen.getByRole('button', { name: /A4/i });
      expect(a4Button).toHaveAttribute('data-selected', 'true');
    });

    it('calls setSize when a size is clicked', () => {
      render(<CustomizePage />);
      const a3Button = screen.getByRole('button', { name: /A3/i });
      fireEvent.click(a3Button);
      expect(mockSetSize).toHaveBeenCalledWith('A3');
    });
  });

  describe('Paper Selector', () => {
    it('renders paper section title "סוג נייר"', () => {
      render(<CustomizePage />);
      expect(screen.getByText('סוג נייר')).toBeInTheDocument();
    });

    it('renders all 3 paper options', () => {
      render(<CustomizePage />);
      expect(screen.getByRole('button', { name: /Fine Art Matte/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Glossy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Canvas/i })).toBeInTheDocument();
    });

    it('shows "כלול" for matte paper', () => {
      render(<CustomizePage />);
      expect(screen.getByText('כלול')).toBeInTheDocument();
    });

    it('shows correct prices for paper upgrades', () => {
      render(<CustomizePage />);
      expect(screen.getByText('+₪20')).toBeInTheDocument(); // Glossy
      expect(screen.getByText('+₪40')).toBeInTheDocument(); // Canvas
    });

    it('highlights selected paper', () => {
      render(<CustomizePage />);
      const matteButton = screen.getByRole('button', { name: /Fine Art Matte/i });
      expect(matteButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls setPaperType when paper is clicked', () => {
      render(<CustomizePage />);
      const glossyButton = screen.getByRole('button', { name: /Glossy/i });
      fireEvent.click(glossyButton);
      expect(mockSetPaperType).toHaveBeenCalledWith('glossy');
    });
  });

  describe('Frame Selector', () => {
    it('renders frame section title "מסגרת"', () => {
      render(<CustomizePage />);
      expect(screen.getByText('מסגרת')).toBeInTheDocument();
    });

    it('renders all 4 frame options', () => {
      render(<CustomizePage />);
      // Frame options in the main options section (not the RoomPreview selector)
      const frameGrid = screen.getByTestId('frame-grid');
      const frameButtons = frameGrid.querySelectorAll('button');
      expect(frameButtons.length).toBe(4);
    });

    it('shows "חינם" for no frame', () => {
      render(<CustomizePage />);
      expect(screen.getByText('חינם')).toBeInTheDocument();
    });

    it('shows correct prices for frames', () => {
      render(<CustomizePage />);
      // +₪60 appears twice (black and white)
      const prices60 = screen.getAllByText('+₪60');
      expect(prices60.length).toBe(2);
      expect(screen.getByText('+₪80')).toBeInTheDocument(); // Oak
    });

    it('highlights selected frame', () => {
      render(<CustomizePage />);
      // Find black frame button in the frame-grid section by aria-label
      const frameGrid = screen.getByTestId('frame-grid');
      const blackButton = frameGrid.querySelector('button[aria-label="שחור"]');
      expect(blackButton).toHaveAttribute('data-selected', 'true');
    });

    it('calls setFrameType when frame is clicked', () => {
      render(<CustomizePage />);
      // Find oak frame button in the frame-grid section by aria-label
      const frameGrid = screen.getByTestId('frame-grid');
      const oakButton = frameGrid.querySelector('button[aria-label="אלון"]');
      fireEvent.click(oakButton!);
      expect(mockSetFrameType).toHaveBeenCalledWith('oak');
    });

    it('renders frame color preview squares', () => {
      render(<CustomizePage />);
      const blackPreview = screen.getByTestId('frame-preview-black');
      const whitePreview = screen.getByTestId('frame-preview-white');
      const oakPreview = screen.getByTestId('frame-preview-oak');
      expect(blackPreview).toBeInTheDocument();
      expect(whitePreview).toBeInTheDocument();
      expect(oakPreview).toBeInTheDocument();
    });
  });

  describe('Price Calculation', () => {
    it('displays total price in bottom CTA', () => {
      render(<CustomizePage />);
      // A4 (149) + matte (0) + black (60) = 209
      expect(screen.getByTestId('total-price')).toHaveTextContent('₪209');
    });

    it('shows "+ משלוח" after price', () => {
      render(<CustomizePage />);
      expect(screen.getByText(/\+ משלוח/)).toBeInTheDocument();
    });

    it('updates price when size changes', () => {
      const { rerender } = render(<CustomizePage />);

      // Change to A3
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSize: mockSetSize,
        setPaperType: mockSetPaperType,
        setFrameType: mockSetFrameType,
        setIsGift: mockSetIsGift,
        setGiftMessage: mockSetGiftMessage,
        originalImage: 'blob:test-image-url',
        transformedImage: null,
        selectedStyle: 'pop_art',
        currentStep: 'customize',
        size: 'A3', // Changed
        paperType: 'matte',
        frameType: 'black',
        isGift: false,
        giftMessage: '',
        _hasHydrated: true,
      });

      rerender(<CustomizePage />);
      // A3 (249) + matte (0) + black (60) = 309
      expect(screen.getByTestId('total-price')).toHaveTextContent('₪309');
    });

    it('updates price when paper changes', () => {
      const { rerender } = render(<CustomizePage />);

      // Change to glossy
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSize: mockSetSize,
        setPaperType: mockSetPaperType,
        setFrameType: mockSetFrameType,
        setIsGift: mockSetIsGift,
        setGiftMessage: mockSetGiftMessage,
        originalImage: 'blob:test-image-url',
        transformedImage: null,
        selectedStyle: 'pop_art',
        currentStep: 'customize',
        size: 'A4',
        paperType: 'glossy', // Changed
        frameType: 'black',
        isGift: false,
        giftMessage: '',
        _hasHydrated: true,
      });

      rerender(<CustomizePage />);
      // A4 (149) + glossy (20) + black (60) = 229
      expect(screen.getByTestId('total-price')).toHaveTextContent('₪229');
    });

    it('updates price when frame changes', () => {
      const { rerender } = render(<CustomizePage />);

      // Change to oak
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSize: mockSetSize,
        setPaperType: mockSetPaperType,
        setFrameType: mockSetFrameType,
        setIsGift: mockSetIsGift,
        setGiftMessage: mockSetGiftMessage,
        originalImage: 'blob:test-image-url',
        transformedImage: null,
        selectedStyle: 'pop_art',
        currentStep: 'customize',
        size: 'A4',
        paperType: 'matte',
        frameType: 'oak', // Changed
        isGift: false,
        giftMessage: '',
        _hasHydrated: true,
      });

      rerender(<CustomizePage />);
      // A4 (149) + matte (0) + oak (80) = 229
      expect(screen.getByTestId('total-price')).toHaveTextContent('₪229');
    });
  });

  describe('Bottom CTA', () => {
    it('renders continue button and price summary', () => {
      render(<CustomizePage />);
      const continueBtn = screen.getByRole('button', { name: /המשך לתשלום/i });
      expect(continueBtn).toBeInTheDocument();
    });

    it('renders continue button "המשך לתשלום"', () => {
      render(<CustomizePage />);
      expect(screen.getByRole('button', { name: /המשך לתשלום/i })).toBeInTheDocument();
    });

    it('renders price summary section', () => {
      render(<CustomizePage />);
      expect(screen.getByText('סה״כ')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back when header back button clicked', () => {
      render(<CustomizePage />);
      const backButtons = screen.getAllByRole('button', { name: /חזרה|back/i });
      fireEvent.click(backButtons[0]);
      expect(mockPush).toHaveBeenCalledWith('/create/tweak');
    });

    it('navigates to checkout when continue clicked', () => {
      render(<CustomizePage />);
      const continueButton = screen.getByRole('button', { name: /המשך לתשלום/i });
      fireEvent.click(continueButton);
      expect(mockSetStep).toHaveBeenCalledWith('checkout');
      expect(mockPush).toHaveBeenCalledWith('/create/checkout');
    });
  });

  describe('Redirect without image', () => {
    it('redirects to upload page if no original image', () => {
      (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        setStep: mockSetStep,
        setSize: mockSetSize,
        setPaperType: mockSetPaperType,
        setFrameType: mockSetFrameType,
        setIsGift: mockSetIsGift,
        setGiftMessage: mockSetGiftMessage,
        originalImage: null,
        transformedImage: null,
        selectedStyle: null,
        currentStep: 'customize',
        size: 'A4',
        paperType: 'matte',
        frameType: 'none',
        isGift: false,
        giftMessage: '',
        _hasHydrated: true,
      });

      render(<CustomizePage />);
      expect(mockPush).toHaveBeenCalledWith('/create');
    });
  });

  describe('Responsive Design', () => {
    it('renders size grid with correct test id', () => {
      render(<CustomizePage />);
      const sizeGrid = screen.getByTestId('size-grid');
      expect(sizeGrid).toBeInTheDocument();
    });

    it('renders frame grid with correct test id', () => {
      render(<CustomizePage />);
      const frameGrid = screen.getByTestId('frame-grid');
      expect(frameGrid).toBeInTheDocument();
    });
  });
});
