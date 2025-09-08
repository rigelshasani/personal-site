/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useViewCounter } from '@/hooks/useViewCounter'
import * as viewCounterModule from '@/lib/view-counter'

// Mock the view counter module
jest.mock('@/lib/view-counter')

const mockViewCounter = viewCounterModule as jest.Mocked<typeof viewCounterModule>

// Mock setTimeout
jest.useFakeTimers()

describe('useViewCounter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    // Reset timers
    jest.clearAllTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should return initial view count', () => {
    mockViewCounter.getViewCount.mockReturnValue(5)

    const { result } = renderHook(() => useViewCounter('test-post'))

    expect(result.current.viewCount).toBe(5)
    expect(result.current.hasIncremented).toBe(false)
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('test-post')
  })

  it('should return 0 for new posts', () => {
    mockViewCounter.getViewCount.mockReturnValue(0)

    const { result } = renderHook(() => useViewCounter('new-post'))

    expect(result.current.viewCount).toBe(0)
    expect(result.current.hasIncremented).toBe(false)
  })

  it('should increment view count after delay', async () => {
    mockViewCounter.getViewCount.mockReturnValue(3)
    mockViewCounter.incrementViewCount.mockReturnValue(4)

    const { result } = renderHook(() => useViewCounter('test-post'))

    expect(result.current.viewCount).toBe(3)
    expect(result.current.hasIncremented).toBe(false)

    // Fast-forward past the delay
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(result.current.viewCount).toBe(4)
      expect(result.current.hasIncremented).toBe(true)
    })

    expect(mockViewCounter.incrementViewCount).toHaveBeenCalledWith('test-post')
  })

  it('should not increment if component unmounts before delay', () => {
    mockViewCounter.getViewCount.mockReturnValue(2)
    mockViewCounter.incrementViewCount.mockReturnValue(3)

    const { result, unmount } = renderHook(() => useViewCounter('test-post'))

    expect(result.current.viewCount).toBe(2)

    // Unmount before the delay completes
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    unmount()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(mockViewCounter.incrementViewCount).not.toHaveBeenCalled()
  })

  it('should handle different slugs independently', () => {
    mockViewCounter.getViewCount
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(10)

    const { result: result1 } = renderHook(() => useViewCounter('post-1'))
    const { result: result2 } = renderHook(() => useViewCounter('post-2'))

    expect(result1.current.viewCount).toBe(5)
    expect(result2.current.viewCount).toBe(10)
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('post-1')
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('post-2')
  })

  it('should handle slug changes correctly', async () => {
    mockViewCounter.getViewCount
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(8)
    mockViewCounter.incrementViewCount
      .mockReturnValueOnce(6)
      .mockReturnValueOnce(9)

    const { result, rerender } = renderHook(
      ({ slug }) => useViewCounter(slug),
      { initialProps: { slug: 'post-1' } }
    )

    expect(result.current.viewCount).toBe(5)

    // Change to different slug
    rerender({ slug: 'post-2' })
    expect(result.current.viewCount).toBe(8)
    expect(result.current.hasIncremented).toBe(false) // Reset for new slug

    // Let timer complete for post-2
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(result.current.viewCount).toBe(9)
      expect(result.current.hasIncremented).toBe(true)
    })

    expect(mockViewCounter.incrementViewCount).toHaveBeenCalledWith('post-2')
  })

  it('should handle empty slug', () => {
    mockViewCounter.getViewCount.mockReturnValue(0)

    const { result } = renderHook(() => useViewCounter(''))

    expect(result.current.viewCount).toBe(0)
    expect(result.current.hasIncremented).toBe(false)
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('')
  })

  it('should clean up timers on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    mockViewCounter.getViewCount.mockReturnValue(1)

    const { unmount } = renderHook(() => useViewCounter('test-post'))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('should only increment once per session', async () => {
    mockViewCounter.getViewCount.mockReturnValue(5)
    mockViewCounter.incrementViewCount.mockReturnValue(6)

    const { result } = renderHook(() => useViewCounter('test-post'))

    // First increment
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(result.current.hasIncremented).toBe(true)
    })

    expect(mockViewCounter.incrementViewCount).toHaveBeenCalledTimes(1)

    // Additional time should not trigger another increment
    act(() => {
      jest.advanceTimersByTime(10000)
    })

    expect(mockViewCounter.incrementViewCount).toHaveBeenCalledTimes(1)
  })

  it('should handle errors in increment gracefully', async () => {
    mockViewCounter.getViewCount.mockReturnValue(3)
    mockViewCounter.incrementViewCount.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const { result } = renderHook(() => useViewCounter('test-post'))

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Should not crash, but hasIncremented might still be set
    await waitFor(() => {
      expect(result.current.hasIncremented).toBe(true)
    })

    // View count should remain the same since increment failed
    expect(result.current.viewCount).toBe(3)
  })

  it('should use correct delay time', () => {
    mockViewCounter.getViewCount.mockReturnValue(1)
    mockViewCounter.incrementViewCount.mockReturnValue(2)

    renderHook(() => useViewCounter('test-post'))

    // Should not increment before 5 seconds
    act(() => {
      jest.advanceTimersByTime(4999)
    })
    expect(mockViewCounter.incrementViewCount).not.toHaveBeenCalled()

    // Should increment at 5 seconds
    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockViewCounter.incrementViewCount).toHaveBeenCalled()
  })
})