/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ViewCount } from '@/components/ViewCounter'
import * as viewCounterModule from '@/lib/view-counter'

// Mock the view counter module
jest.mock('@/lib/view-counter')

const mockViewCounter = viewCounterModule as jest.Mocked<typeof viewCounterModule>

describe('ViewCounter Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  it('should render view count for a post', () => {
    mockViewCounter.getViewCount.mockReturnValue(5)
    mockViewCounter.formatViewCount.mockReturnValue('5 views')

    render(<ViewCount slug="test-post" />)

    expect(screen.getByText('5 views')).toBeInTheDocument()
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('test-post')
    expect(mockViewCounter.formatViewCount).toHaveBeenCalledWith(5)
  })

  it('should render 0 views for new posts', () => {
    mockViewCounter.getViewCount.mockReturnValue(0)
    mockViewCounter.formatViewCount.mockReturnValue('0 views')

    render(<ViewCount slug="new-post" />)

    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should handle large view counts', () => {
    mockViewCounter.getViewCount.mockReturnValue(1500)
    mockViewCounter.formatViewCount.mockReturnValue('1.5k views')

    render(<ViewCount slug="popular-post" />)

    expect(screen.getByText('1.5k views')).toBeInTheDocument()
  })

  it('should update when view count changes', () => {
    mockViewCounter.getViewCount.mockReturnValue(3)
    mockViewCounter.formatViewCount.mockReturnValue('3 views')

    const { rerender } = render(<ViewCount slug="test-post" />)
    expect(screen.getByText('3 views')).toBeInTheDocument()

    // Simulate view count increase
    mockViewCounter.getViewCount.mockReturnValue(4)
    mockViewCounter.formatViewCount.mockReturnValue('4 views')

    rerender(<ViewCount slug="test-post" />)
    expect(screen.getByText('4 views')).toBeInTheDocument()
  })

  it('should handle different slugs independently', () => {
    mockViewCounter.getViewCount
      .mockReturnValueOnce(10)
      .mockReturnValueOnce(25)
    mockViewCounter.formatViewCount
      .mockReturnValueOnce('10 views')
      .mockReturnValueOnce('25 views')

    const { container } = render(
      <div>
        <ViewCount slug="post-1" />
        <ViewCount slug="post-2" />
      </div>
    )

    expect(screen.getByText('10 views')).toBeInTheDocument()
    expect(screen.getByText('25 views')).toBeInTheDocument()
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('post-1')
    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('post-2')
  })

  it('should have appropriate styling classes', () => {
    mockViewCounter.getViewCount.mockReturnValue(1)
    mockViewCounter.formatViewCount.mockReturnValue('1 view')

    render(<ViewCount slug="test-post" />)

    const viewElement = screen.getByText('1 view')
    expect(viewElement).toHaveClass('text-xs', 'text-mid')
  })

  it('should handle empty slug gracefully', () => {
    mockViewCounter.getViewCount.mockReturnValue(0)
    mockViewCounter.formatViewCount.mockReturnValue('0 views')

    render(<ViewCount slug="" />)

    expect(mockViewCounter.getViewCount).toHaveBeenCalledWith('')
    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should render as inline element', () => {
    mockViewCounter.getViewCount.mockReturnValue(42)
    mockViewCounter.formatViewCount.mockReturnValue('42 views')

    render(<ViewCount slug="test-post" />)

    const viewElement = screen.getByText('42 views')
    expect(viewElement.tagName.toLowerCase()).toBe('span')
  })

  it('should maintain consistent formatting', () => {
    const testCases = [
      { count: 1, expected: '1 view' },
      { count: 999, expected: '999 views' },
      { count: 1000, expected: '1k views' },
      { count: 1500000, expected: '1.5M views' }
    ]

    testCases.forEach(({ count, expected }) => {
      mockViewCounter.getViewCount.mockReturnValue(count)
      mockViewCounter.formatViewCount.mockReturnValue(expected)

      const { unmount } = render(<ViewCount slug={`test-${count}`} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })
})