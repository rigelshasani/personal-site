import fs from 'fs'
import path from 'path'
import { 
  generateSlug, 
  createPostFile, 
  updatePostFile, 
  deletePostFile,
  validatePostData 
} from '@/lib/post-utils'
import { PostMeta } from '@/lib/content'

// Mock fs module
jest.mock('fs')
const mockFs = fs as jest.Mocked<typeof fs>

describe('Post Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateSlug', () => {
    it('should generate slug from title', () => {
      expect(generateSlug('Hello World Post')).toBe('hello-world-post')
      expect(generateSlug('Testing! Special @#$ Characters')).toBe('testing-special-characters')
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces')
      expect(generateSlug('Already-Has-Dashes')).toBe('already-has-dashes')
      expect(generateSlug('Unicode Characters: 你好')).toBe('unicode-characters')
    })

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('')
      expect(generateSlug('---')).toBe('')
      expect(generateSlug('123 Numbers Only')).toBe('123-numbers-only')
    })
  })

  describe('validatePostData', () => {
    const validMeta: PostMeta = {
      title: 'Test Post',
      description: 'A test post description',
      date: '2023-12-01',
      tags: ['test', 'jest'],
    }

    const validContent = '# Test Post\n\nThis is test content.'

    it('should validate correct post data', () => {
      expect(() => validatePostData(validMeta, validContent)).not.toThrow()
    })

    it('should throw for missing title', () => {
      const meta = { ...validMeta, title: '' }
      expect(() => validatePostData(meta, validContent)).toThrow('Title is required')
    })

    it('should throw for missing description', () => {
      const meta = { ...validMeta, description: '' }
      expect(() => validatePostData(meta, validContent)).toThrow('Description is required')
    })

    it('should throw for missing date', () => {
      const meta = { ...validMeta, date: '' }
      expect(() => validatePostData(meta, validContent)).toThrow('Date is required')
    })

    it('should throw for missing content', () => {
      expect(() => validatePostData(validMeta, '')).toThrow('Content is required')
    })

    it('should throw for invalid date', () => {
      const meta = { ...validMeta, date: 'invalid-date' }
      expect(() => validatePostData(meta, validContent)).toThrow('Invalid date format')
    })

    it('should throw for invalid tags', () => {
      const meta = { ...validMeta, tags: 'not-array' as any }
      expect(() => validatePostData(meta, validContent)).toThrow('Tags must be an array')
    })

    it('should throw for invalid order', () => {
      const meta = { ...validMeta, order: -1 }
      expect(() => validatePostData(meta, validContent)).toThrow('Order must be a positive integer')
    })
  })

  describe('createPostFile', () => {
    it('should create post file successfully', () => {
      mockFs.existsSync.mockReturnValue(false)
      mockFs.mkdirSync.mockReturnValue(undefined)
      mockFs.writeFileSync.mockReturnValue()

      const meta: PostMeta = {
        title: 'Test Post',
        description: 'Test description',
        date: '2023-12-01',
      }

      expect(() => createPostFile('test-post', meta, '# Test content')).not.toThrow()
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should throw if file already exists', () => {
      mockFs.existsSync.mockReturnValue(true)

      expect(() => 
        createPostFile('existing-post', {} as PostMeta, 'content')
      ).toThrow('Post with this slug already exists')
    })
  })

  describe('updatePostFile', () => {
    it('should update existing post file', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.writeFileSync.mockReturnValue()

      expect(() => 
        updatePostFile('existing-post', {} as PostMeta, 'updated content')
      ).not.toThrow()
      expect(mockFs.writeFileSync).toHaveBeenCalled()
    })

    it('should throw if file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false)

      expect(() => 
        updatePostFile('nonexistent-post', {} as PostMeta, 'content')
      ).toThrow('Post not found')
    })
  })

  describe('deletePostFile', () => {
    it('should delete existing post file', () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.unlinkSync.mockReturnValue()

      expect(() => deletePostFile('existing-post')).not.toThrow()
      expect(mockFs.unlinkSync).toHaveBeenCalled()
    })

    it('should throw if file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false)

      expect(() => deletePostFile('nonexistent-post')).toThrow('Post not found')
    })
  })
})