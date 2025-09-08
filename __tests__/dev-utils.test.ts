/**
 * @jest-environment node
 */
import fs from 'fs'
import path from 'path'
import { 
  isDevelopment,
  watchContentChanges,
  cacheContent,
  devLog,
  validateFrontmatter,
  validateContent,
  validatePost
} from '@/lib/dev-utils'

// Mock fs
jest.mock('fs')
const mockFs = fs as jest.Mocked<typeof fs>

describe('Dev Utils', () => {
  let originalNodeEnv: string | undefined
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV
  })

  beforeEach(() => {
    jest.clearAllMocks()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  describe('isDevelopment', () => {
    it('should return true in development', () => {
      process.env.NODE_ENV = 'development'
      expect(isDevelopment()).toBe(true)
    })

    it('should return false in production', () => {
      process.env.NODE_ENV = 'production'
      expect(isDevelopment()).toBe(false)
    })

    it('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV
      expect(isDevelopment()).toBe(false)
    })
  })

  describe('watchContentChanges', () => {
    beforeEach(() => {
      jest.spyOn(process, 'cwd').mockReturnValue('/test')
      jest.spyOn(path, 'join').mockReturnValue('/test/src/content')
    })

    it('should not watch in production', () => {
      process.env.NODE_ENV = 'production'
      const result = watchContentChanges()
      expect(result).toBeUndefined()
    })

    it('should set up file watching in development', () => {
      process.env.NODE_ENV = 'development'
      
      const mockStats = { mtime: new Date(Date.now() + 1000) }
      mockFs.statSync.mockReturnValue(mockStats as any)

      watchContentChanges()
      
      expect(mockFs.statSync).toHaveBeenCalledWith('/test/src/content')
    })

    it('should handle stat errors gracefully', () => {
      process.env.NODE_ENV = 'development'
      
      mockFs.statSync.mockImplementation(() => {
        throw new Error('ENOENT')
      })

      expect(() => watchContentChanges()).not.toThrow()
      expect(consoleWarnSpy).toHaveBeenCalledWith('Could not check content directory for changes')
    })
  })

  describe('cacheContent', () => {
    it('should not cache in production', () => {
      process.env.NODE_ENV = 'production'
      const factory = jest.fn().mockReturnValue('result')
      
      const result = cacheContent('test-key', factory)
      
      expect(result).toBe('result')
      expect(factory).toHaveBeenCalled()
    })

    it('should cache results in development', () => {
      process.env.NODE_ENV = 'development'
      const factory = jest.fn().mockReturnValue('cached-result')
      
      // First call should invoke factory
      const result1 = cacheContent('cache-test', factory)
      expect(result1).toBe('cached-result')
      expect(factory).toHaveBeenCalledTimes(1)
      
      // Second call should return cached value
      const result2 = cacheContent('cache-test', factory)
      expect(result2).toBe('cached-result')
      expect(factory).toHaveBeenCalledTimes(1) // Not called again
    })
  })

  describe('devLog', () => {
    it('should log in development', () => {
      process.env.NODE_ENV = 'development'
      devLog('test message', { data: 'value' })
      
      expect(consoleLogSpy).toHaveBeenCalledWith('📝 [Content] test message', { data: 'value' })
    })

    it('should not log in production', () => {
      process.env.NODE_ENV = 'production'
      devLog('test message')
      
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should log without data parameter', () => {
      process.env.NODE_ENV = 'development'
      devLog('test message')
      
      expect(consoleLogSpy).toHaveBeenCalledWith('📝 [Content] test message', '')
    })
  })

  describe('validateFrontmatter', () => {
    const validFrontmatter = {
      title: 'Valid Post Title',
      description: 'A valid description that is not too short or too long.',
      date: '2023-12-01'
    }

    it('should validate correct frontmatter', () => {
      process.env.NODE_ENV = 'development'
      const result = validateFrontmatter(validFrontmatter, 'test.mdx')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(consoleLogSpy).toHaveBeenCalledWith('📝 [Content] ✅ [test.mdx] Frontmatter validation passed', '')
    })

    it('should detect missing required fields', () => {
      const invalidFrontmatter = { title: 'Test' }
      const result = validateFrontmatter(invalidFrontmatter, 'test.mdx')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(e => e.field === 'date' && e.message === 'Missing required field: date')).toBe(true)
      expect(result.errors.some(e => e.field === 'description' && e.message === 'Missing required field: description')).toBe(true)
    })

    it('should validate empty string fields', () => {
      const invalidFrontmatter = {
        title: '',
        description: '   ',
        date: '2023-12-01'
      }
      const result = validateFrontmatter(invalidFrontmatter, 'test.mdx')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'title')).toBe(true)
      expect(result.errors.some(e => e.field === 'description')).toBe(true)
    })

    it('should warn about title length issues', () => {
      const shortTitle = { ...validFrontmatter, title: 'Short' }
      const longTitle = { ...validFrontmatter, title: 'a'.repeat(101) }
      
      const shortResult = validateFrontmatter(shortTitle, 'test.mdx')
      const longResult = validateFrontmatter(longTitle, 'test.mdx')
      
      expect(shortResult.warnings.some(w => w.field === 'title' && w.message.includes('shorter than 10 characters'))).toBe(true)
      expect(longResult.warnings.some(w => w.field === 'title' && w.message.includes('longer than 100 characters'))).toBe(true)
    })

    it('should validate description length', () => {
      const shortDesc = { ...validFrontmatter, description: 'Short' }
      const longDesc = { ...validFrontmatter, description: 'a'.repeat(161) }
      
      const shortResult = validateFrontmatter(shortDesc, 'test.mdx')
      const longResult = validateFrontmatter(longDesc, 'test.mdx')
      
      expect(shortResult.warnings.some(w => w.field === 'description' && w.message.includes('shorter than 20 characters'))).toBe(true)
      expect(longResult.warnings.some(w => w.field === 'description' && w.message.includes('longer than 160 characters'))).toBe(true)
    })

    it('should validate date format', () => {
      const invalidDate = { ...validFrontmatter, date: 'invalid-date' }
      const wrongFormat = { ...validFrontmatter, date: '12/01/2023' }
      const futureDate = { ...validFrontmatter, date: '2025-12-31' }
      
      const invalidResult = validateFrontmatter(invalidDate, 'test.mdx')
      const formatResult = validateFrontmatter(wrongFormat, 'test.mdx')
      const futureResult = validateFrontmatter(futureDate, 'test.mdx')
      
      expect(invalidResult.errors.some(e => e.field === 'date' && e.message.includes('Invalid date format'))).toBe(true)
      expect(formatResult.warnings.some(w => w.field === 'date' && w.message.includes('Date format should be YYYY-MM-DD'))).toBe(true)
      expect(futureResult.warnings.some(w => w.field === 'date' && w.message.includes('Post date is in the future'))).toBe(true)
    })

    it('should validate tags array', () => {
      const nonArrayTags = { ...validFrontmatter, tags: 'not-array' }
      const nonStringTags = { ...validFrontmatter, tags: ['valid', 123, 'another'] }
      const spacedTags = { ...validFrontmatter, tags: ['spaced tag', 'valid'] }
      const tooManyTags = { ...validFrontmatter, tags: ['1', '2', '3', '4', '5', '6', '7'] }
      const duplicateTags = { ...validFrontmatter, tags: ['tag1', 'tag2', 'tag1'] }
      
      expect(validateFrontmatter(nonArrayTags, 'test.mdx').errors.some(e => e.field === 'tags' && e.message === 'Tags must be an array')).toBe(true)
      expect(validateFrontmatter(nonStringTags, 'test.mdx').errors.some(e => e.field === 'tags[1]' && e.message === 'All tags must be strings')).toBe(true)
      expect(validateFrontmatter(spacedTags, 'test.mdx').warnings.some(w => w.field === 'tags[0]' && w.message.includes('contains spaces'))).toBe(true)
      expect(validateFrontmatter(tooManyTags, 'test.mdx').warnings.some(w => w.field === 'tags' && w.message.includes('7 tags found'))).toBe(true)
      expect(validateFrontmatter(duplicateTags, 'test.mdx').warnings.some(w => w.field === 'tags' && w.message === 'Duplicate tags found')).toBe(true)
    })

    it('should validate project field', () => {
      const nonStringProject = { ...validFrontmatter, project: 123 }
      const invalidProject = { ...validFrontmatter, project: 'Invalid Project Name' }
      
      expect(validateFrontmatter(nonStringProject, 'test.mdx').errors.some(e => e.field === 'project' && e.message === 'Project must be a string')).toBe(true)
      expect(validateFrontmatter(invalidProject, 'test.mdx').warnings.some(w => w.field === 'project' && w.message.includes('should be lowercase'))).toBe(true)
    })

    it('should validate order field', () => {
      const negativeOrder = { ...validFrontmatter, order: -1 }
      const floatOrder = { ...validFrontmatter, order: 1.5 }
      const zeroOrder = { ...validFrontmatter, order: 0 }
      
      expect(validateFrontmatter(negativeOrder, 'test.mdx').errors.some(e => e.field === 'order')).toBe(true)
      expect(validateFrontmatter(floatOrder, 'test.mdx').errors.some(e => e.field === 'order')).toBe(true)
      expect(validateFrontmatter(zeroOrder, 'test.mdx').errors.some(e => e.field === 'order')).toBe(true)
    })

    it('should validate images array', () => {
      const nonArrayImages = { ...validFrontmatter, images: 'not-array' }
      const nonStringImages = { ...validFrontmatter, images: ['/valid.jpg', 123] }
      const invalidPath = { ...validFrontmatter, images: ['invalid-path.jpg'] }
      
      expect(validateFrontmatter(nonArrayImages, 'test.mdx').errors.some(e => e.field === 'images' && e.message === 'Images must be an array')).toBe(true)
      expect(validateFrontmatter(nonStringImages, 'test.mdx').errors.some(e => e.field === 'images[1]')).toBe(true)
      expect(validateFrontmatter(invalidPath, 'test.mdx').warnings.some(w => w.field === 'images[0]' && w.message.includes('should start with'))).toBe(true)
    })
  })

  describe('validateContent', () => {
    const validContent = '# Test Post\n\nThis is valid content with enough words to pass the minimum length requirement for content validation.'

    it('should validate correct content', () => {
      process.env.NODE_ENV = 'development'
      const result = validateContent(validContent, 'test.mdx')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect empty content', () => {
      const result = validateContent('', 'test.mdx')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.field === 'content' && e.message === 'Post content is empty')).toBe(true)
    })

    it('should warn about short content', () => {
      const shortContent = 'Short content'
      const result = validateContent(shortContent, 'test.mdx')
      
      expect(result.warnings.some(w => w.field === 'content' && w.message.includes('only 2 words'))).toBe(true)
    })

    it('should warn about missing headings', () => {
      const noHeadingContent = 'This content has no headings at all just plain text without structure'
      const result = validateContent(noHeadingContent, 'test.mdx')
      
      expect(result.warnings.some(w => w.field === 'content' && w.message === 'No headings found in content')).toBe(true)
    })

    it('should validate image references', () => {
      const suspiciousImage = '![Alt text](/suspicious-path)\n\n' + validContent
      const result = validateContent(suspiciousImage, 'test.mdx')
      
      expect(result.warnings.some(w => w.field.includes('image') && w.message.includes('Suspicious image path'))).toBe(true)
    })

    it('should validate Figure components', () => {
      const figureWithoutAlt = '<Figure src="/image.jpg" />\n\n' + validContent
      const figureWithAlt = '<Figure src="/image.jpg" alt="Description" />\n\n' + validContent
      
      const withoutAltResult = validateContent(figureWithoutAlt, 'test.mdx')
      const withAltResult = validateContent(figureWithAlt, 'test.mdx')
      
      expect(withoutAltResult.warnings.some(w => w.field.includes('figure') && w.message.includes('missing alt attribute'))).toBe(true)
      expect(withAltResult.warnings.some(w => w.field.includes('figure'))).toBe(false)
    })
  })

  describe('validatePost', () => {
    const validFrontmatter = {
      title: 'Valid Post Title',
      description: 'A valid description that is not too short.',
      date: '2023-12-01'
    }
    const validContent = '# Test Post\n\nThis is valid content with enough words to pass validation.'

    it('should combine frontmatter and content validation', () => {
      const result = validatePost(validFrontmatter, validContent, 'test.mdx')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect errors in both frontmatter and content', () => {
      const invalidFrontmatter = { title: '' }
      const invalidContent = ''
      
      const result = validatePost(invalidFrontmatter, invalidContent, 'test.mdx')
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1) // Should have errors from both
    })

    it('should combine warnings from both validations', () => {
      const shortTitleFrontmatter = { ...validFrontmatter, title: 'Short' }
      const noHeadingContent = 'Content without headings but with enough words to not trigger length warning'
      
      const result = validatePost(shortTitleFrontmatter, noHeadingContent, 'test.mdx')
      
      expect(result.warnings.length).toBeGreaterThanOrEqual(2) // Should have warnings from both
    })
  })
})