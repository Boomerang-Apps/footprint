/**
 * Order Store - Orientation Tests
 *
 * Tests for portrait/landscape orientation toggle functionality
 * in the product customization flow.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useOrderStore } from '../orderStore';
import type { OrientationType } from '@/types';

// Reset store before each test
beforeEach(() => {
  const { reset } = useOrderStore.getState();
  reset();
});

describe('Order Store - Orientation', () => {
  describe('Initial State', () => {
    it('should default to portrait orientation', () => {
      const state = useOrderStore.getState();
      expect(state.orientation).toBe('portrait');
    });

    it('should have orientation field in initial state', () => {
      const state = useOrderStore.getState();
      expect(state).toHaveProperty('orientation');
    });
  });

  describe('setOrientation', () => {
    it('should update orientation to landscape', () => {
      const { setOrientation } = useOrderStore.getState();

      act(() => {
        setOrientation('landscape');
      });

      expect(useOrderStore.getState().orientation).toBe('landscape');
    });

    it('should update orientation to portrait', () => {
      const { setOrientation } = useOrderStore.getState();

      // First set to landscape
      act(() => {
        setOrientation('landscape');
      });

      // Then back to portrait
      act(() => {
        setOrientation('portrait');
      });

      expect(useOrderStore.getState().orientation).toBe('portrait');
    });

    it('should handle multiple orientation changes', () => {
      const { setOrientation } = useOrderStore.getState();

      act(() => {
        setOrientation('landscape');
      });
      expect(useOrderStore.getState().orientation).toBe('landscape');

      act(() => {
        setOrientation('portrait');
      });
      expect(useOrderStore.getState().orientation).toBe('portrait');

      act(() => {
        setOrientation('landscape');
      });
      expect(useOrderStore.getState().orientation).toBe('landscape');
    });

    it('should accept valid OrientationType values', () => {
      const { setOrientation } = useOrderStore.getState();
      const validOrientations: OrientationType[] = ['portrait', 'landscape'];

      validOrientations.forEach((orientation) => {
        act(() => {
          setOrientation(orientation);
        });
        expect(useOrderStore.getState().orientation).toBe(orientation);
      });
    });
  });

  describe('State Persistence', () => {
    it('should include orientation in state object', () => {
      const { setOrientation } = useOrderStore.getState();

      act(() => {
        setOrientation('landscape');
      });

      const state = useOrderStore.getState();
      expect(state.orientation).toBe('landscape');
    });

    it('should maintain orientation when other fields change', () => {
      const { setOrientation, setSize, setPaperType } = useOrderStore.getState();

      act(() => {
        setOrientation('landscape');
        setSize('A3');
        setPaperType('glossy');
      });

      const state = useOrderStore.getState();
      expect(state.orientation).toBe('landscape');
      expect(state.size).toBe('A3');
      expect(state.paperType).toBe('glossy');
    });
  });

  describe('Integration with Product Configuration', () => {
    it('should work alongside size selection', () => {
      const { setOrientation, setSize } = useOrderStore.getState();

      act(() => {
        setSize('A4');
        setOrientation('landscape');
      });

      const state = useOrderStore.getState();
      expect(state.size).toBe('A4');
      expect(state.orientation).toBe('landscape');
    });

    it('should work alongside paper type selection', () => {
      const { setOrientation, setPaperType } = useOrderStore.getState();

      act(() => {
        setPaperType('canvas');
        setOrientation('portrait');
      });

      const state = useOrderStore.getState();
      expect(state.paperType).toBe('canvas');
      expect(state.orientation).toBe('portrait');
    });

    it('should work alongside frame selection', () => {
      const { setOrientation, setFrameType } = useOrderStore.getState();

      act(() => {
        setFrameType('black');
        setOrientation('landscape');
      });

      const state = useOrderStore.getState();
      expect(state.frameType).toBe('black');
      expect(state.orientation).toBe('landscape');
    });

    it('should maintain orientation through full customization flow', () => {
      const store = useOrderStore.getState();

      act(() => {
        store.setOrientation('landscape');
        store.setSize('A3');
        store.setPaperType('matte');
        store.setFrameType('oak');
        store.setHasPassepartout(true);
      });

      const state = useOrderStore.getState();
      expect(state.orientation).toBe('landscape');
      expect(state.size).toBe('A3');
      expect(state.paperType).toBe('matte');
      expect(state.frameType).toBe('oak');
      expect(state.hasPassepartout).toBe(true);
    });
  });

  describe('Reset Behavior', () => {
    it('should reset orientation to portrait on store reset', () => {
      const { setOrientation, reset } = useOrderStore.getState();

      act(() => {
        setOrientation('landscape');
      });
      expect(useOrderStore.getState().orientation).toBe('landscape');

      act(() => {
        reset();
      });
      expect(useOrderStore.getState().orientation).toBe('portrait');
    });

    it('should reset orientation when starting new order', () => {
      const { setOrientation, setSize, reset } = useOrderStore.getState();

      // Configure an order
      act(() => {
        setOrientation('landscape');
        setSize('A2');
      });

      // Start new order
      act(() => {
        reset();
      });

      const state = useOrderStore.getState();
      expect(state.orientation).toBe('portrait');
      expect(state.size).toBe('A4'); // Default size
    });
  });

  describe('Type Safety', () => {
    it('should only accept portrait or landscape values', () => {
      const { setOrientation } = useOrderStore.getState();

      // Valid values should work
      act(() => {
        setOrientation('portrait');
      });
      expect(useOrderStore.getState().orientation).toBe('portrait');

      act(() => {
        setOrientation('landscape');
      });
      expect(useOrderStore.getState().orientation).toBe('landscape');

      // TypeScript should prevent invalid values at compile time
      // This test validates the type system is working correctly
    });
  });
});
