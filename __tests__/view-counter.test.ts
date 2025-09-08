/**
 * @jest-environment jsdom
 */
import {
  getViewCount,
  incrementViewCount,
  formatViewCount,
  getGlobalViewCounts,
  getPopularPosts
} from '@/lib/view-counter'

describe('View Counter', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('getViewCount', () => {
    it('should return 0 for new posts', () => {
      expect(getViewCount('new-post')).toBe(0)
    })

    it('should return stored view count', () => {
      localStorage.setItem('views', JSON.stringify({ 'existing-post': 5 }))
      expect(getViewCount('existing-post')).toBe(5)
    })

    it('should handle malformed localStorage data', () => {
      localStorage.setItem('views', 'invalid-json')
      expect(getViewCount('test-post')).toBe(0)
    })

    it('should handle missing localStorage', () => {
      // Mock localStorage to throw error
      const originalGetItem = Storage.prototype.getItem
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage not available')
      })

      expect(getViewCount('test-post')).toBe(0)

      Storage.prototype.getItem = originalGetItem
    })
  })

  describe('incrementViewCount', () => {
    it('should increment view count for new posts', () => {
      const result = incrementViewCount('new-post')
      expect(result).toBe(1)
      expect(getViewCount('new-post')).toBe(1)
    })

    it('should increment existing view count', () => {
      localStorage.setItem('views', JSON.stringify({ 'existing-post': 3 }))
      const result = incrementViewCount('existing-post')
      expect(result).toBe(4)
      expect(getViewCount('existing-post')).toBe(4)
    })

    it('should preserve other post counts', () => {
      localStorage.setItem('views', JSON.stringify({ 
        'post-1': 5, 
        'post-2': 10 
      }))
      
      incrementViewCount('post-1')
      
      expect(getViewCount('post-1')).toBe(6)
      expect(getViewCount('post-2')).toBe(10)
    })

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('localStorage full')
      })

      // Should not throw error
      expect(() => incrementViewCount('test-post')).not.toThrow()

      Storage.prototype.setItem = originalSetItem
    })

    it('should handle malformed existing data', () => {
      localStorage.setItem('views', 'invalid-json')
      const result = incrementViewCount('test-post')
      expect(result).toBe(1)
    })
  })

  describe('formatViewCount', () => {
    it('should format small numbers correctly', () => {
      expect(formatViewCount(0)).toBe('0 views')
      expect(formatViewCount(1)).toBe('1 view')
      expect(formatViewCount(5)).toBe('5 views')
      expect(formatViewCount(999)).toBe('999 views')
    })

    it('should format thousands correctly', () => {
      expect(formatViewCount(1000)).toBe('1k views')
      expect(formatViewCount(1500)).toBe('1.5k views')
      expect(formatViewCount(2300)).toBe('2.3k views')
      expect(formatViewCount(15000)).toBe('15k views')
      expect(formatViewCount(999999)).toBe('999.9k views')
    })

    it('should format millions correctly', () => {
      expect(formatViewCount(1000000)).toBe('1M views')
      expect(formatViewCount(1500000)).toBe('1.5M views')
      expect(formatViewCount(2300000)).toBe('2.3M views')
      expect(formatViewCount(15000000)).toBe('15M views')
    })

    it('should handle edge cases', () => {
      expect(formatViewCount(1001)).toBe('1k views')
      expect(formatViewCount(1050)).toBe('1k views')
      expect(formatViewCount(1100)).toBe('1.1k views')
      expect(formatViewCount(999000)).toBe('999k views')
      expect(formatViewCount(999900)).toBe('999.9k views')
    })

    it('should handle decimal precision correctly', () => {
      expect(formatViewCount(1230)).toBe('1.2k views')
      expect(formatViewCount(1260)).toBe('1.2k views') // Rounds down
      expect(formatViewCount(1270)).toBe('1.2k views') // Rounds down
      expect(formatViewCount(1280)).toBe('1.2k views') // Rounds down
      expect(formatViewCount(1290)).toBe('1.2k views') // Rounds down
    })

    it('should handle very large numbers', () => {
      expect(formatViewCount(1000000000)).toBe('1000M views')
      expect(formatViewCount(999999999)).toBe('999.9M views')
    })
  })

  describe('getGlobalViewCounts', () => {
    it('should return empty object for no views', () => {
      expect(getGlobalViewCounts()).toEqual({})
    })

    it('should return all stored view counts', () => {
      const viewCounts = {
        'post-1': 5,
        'post-2': 15,
        'post-3': 100
      }
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      expect(getGlobalViewCounts()).toEqual(viewCounts)
    })

    it('should handle malformed localStorage data', () => {
      localStorage.setItem('views', 'invalid-json')
      expect(getGlobalViewCounts()).toEqual({})
    })

    it('should handle localStorage errors', () => {
      const originalGetItem = Storage.prototype.getItem
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      expect(getGlobalViewCounts()).toEqual({})

      Storage.prototype.getItem = originalGetItem
    })
  })

  describe('getPopularPosts', () => {
    it('should return empty array for no views', () => {
      expect(getPopularPosts()).toEqual([])
    })

    it('should return posts sorted by view count', () => {
      const viewCounts = {
        'post-low': 5,
        'post-high': 100,
        'post-medium': 50
      }
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      const popular = getPopularPosts()
      
      expect(popular).toHaveLength(3)
      expect(popular[0]).toEqual({ slug: 'post-high', views: 100 })
      expect(popular[1]).toEqual({ slug: 'post-medium', views: 50 })
      expect(popular[2]).toEqual({ slug: 'post-low', views: 5 })
    })

    it('should limit results to specified count', () => {
      const viewCounts = {
        'post-1': 10,
        'post-2': 20,
        'post-3': 30,
        'post-4': 40,
        'post-5': 50
      }
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      const popular = getPopularPosts(3)
      
      expect(popular).toHaveLength(3)
      expect(popular[0]).toEqual({ slug: 'post-5', views: 50 })
      expect(popular[1]).toEqual({ slug: 'post-4', views: 40 })
      expect(popular[2]).toEqual({ slug: 'post-3', views: 30 })
    })

    it('should handle malformed data gracefully', () => {
      localStorage.setItem('views', 'invalid-json')
      expect(getPopularPosts()).toEqual([])
    })

    it('should filter out zero view counts', () => {
      const viewCounts = {
        'post-1': 10,
        'post-2': 0,
        'post-3': 5
      }
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      const popular = getPopularPosts()
      
      expect(popular).toHaveLength(2)
      expect(popular.some(p => p.slug === 'post-2')).toBe(false)
    })

    it('should handle equal view counts consistently', () => {
      const viewCounts = {
        'post-a': 10,
        'post-b': 10,
        'post-c': 5
      }
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      const popular = getPopularPosts()
      
      expect(popular).toHaveLength(3)
      expect(popular[0].views).toBe(10)
      expect(popular[1].views).toBe(10)
      expect(popular[2].views).toBe(5)
    })

    it('should use default limit of 5', () => {
      const viewCounts = Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [`post-${i}`, i + 1])
      )
      localStorage.setItem('views', JSON.stringify(viewCounts))
      
      const popular = getPopularPosts()
      
      expect(popular).toHaveLength(5) // Default limit
      expect(popular[0]).toEqual({ slug: 'post-9', views: 10 })
      expect(popular[4]).toEqual({ slug: 'post-5', views: 6 })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete workflow', () => {
      // Start with no views
      expect(getViewCount('test-post')).toBe(0)
      
      // Increment multiple times
      incrementViewCount('test-post')
      incrementViewCount('test-post')
      incrementViewCount('test-post')
      
      // Check final count
      expect(getViewCount('test-post')).toBe(3)
      
      // Check formatting
      expect(formatViewCount(getViewCount('test-post'))).toBe('3 views')
      
      // Check it appears in popular posts
      const popular = getPopularPosts()
      expect(popular.some(p => p.slug === 'test-post' && p.views === 3)).toBe(true)
    })

    it('should handle multiple posts correctly', () => {
      const posts = ['post-a', 'post-b', 'post-c']
      const increments = [5, 10, 3]
      
      // Increment each post different amounts
      posts.forEach((post, index) => {
        for (let i = 0; i < increments[index]; i++) {
          incrementViewCount(post)
        }
      })
      
      // Verify counts
      expect(getViewCount('post-a')).toBe(5)
      expect(getViewCount('post-b')).toBe(10)
      expect(getViewCount('post-c')).toBe(3)
      
      // Verify popular order
      const popular = getPopularPosts()
      expect(popular[0].slug).toBe('post-b')
      expect(popular[1].slug).toBe('post-a')
      expect(popular[2].slug).toBe('post-c')
    })
  })
})