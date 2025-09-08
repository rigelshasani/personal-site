import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getAllPosts, getPost, getAllProjects, getProject } from '@/lib/content'

// Mock dependencies
jest.mock('fs')
jest.mock('gray-matter')
jest.mock('@/lib/dev-utils', () => ({
  cacheContent: (key: string, factory: () => any) => factory(),
  devLog: jest.fn(),
  validatePost: jest.fn(),
  watchContentChanges: jest.fn(),
}))

const mockFs = fs as jest.Mocked<typeof fs>
const mockMatter = matter as jest.MockedFunction<typeof matter>

describe('Content Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue('/test')
    
    // Mock path.join
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'))
  })

  describe('getAllPosts', () => {
    it('should return sorted posts', () => {
      const mockFiles = ['post1.mdx', 'post2.mdx']
      const mockPost1Content = {
        data: {
          title: 'Post 1',
          description: 'Description 1',
          date: '2023-12-01',
        },
        content: '# Post 1 content',
      }
      const mockPost2Content = {
        data: {
          title: 'Post 2',
          description: 'Description 2',
          date: '2023-12-02',
        },
        content: '# Post 2 content',
      }

      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValueOnce('post1 file content')
      mockFs.readFileSync.mockReturnValueOnce('post2 file content')
      
      mockMatter.mockReturnValueOnce(mockPost1Content as any)
      mockMatter.mockReturnValueOnce(mockPost2Content as any)

      const posts = getAllPosts()

      expect(posts).toHaveLength(2)
      expect(posts[0].slug).toBe('post2') // More recent post first
      expect(posts[1].slug).toBe('post1')
      expect(posts[0].meta.title).toBe('Post 2')
      expect(posts[0].readingTime).toBe('1 min')
    })

    it('should filter non-MDX files', () => {
      const mockFiles = ['post1.mdx', 'readme.txt', 'post2.mdx', '.DS_Store']
      
      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue('content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Test',
          description: 'Test desc',
          date: '2023-12-01',
        },
        content: 'content',
      } as any)

      const posts = getAllPosts()

      expect(posts).toHaveLength(2)
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2)
    })

    it('should calculate reading time correctly', () => {
      const mockFiles = ['post.mdx']
      const longContent = 'word '.repeat(450) // 450 words = 2 minutes at 225 wpm
      
      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue('file content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Long Post',
          description: 'Description',
          date: '2023-12-01',
        },
        content: longContent,
      } as any)

      const posts = getAllPosts()

      expect(posts[0].readingTime).toBe('2 min')
    })

    it('should use manual reading time if provided', () => {
      const mockFiles = ['post.mdx']
      
      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue('file content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Post',
          description: 'Description',
          date: '2023-12-01',
          readingTime: '5 min read',
        },
        content: 'short content',
      } as any)

      const posts = getAllPosts()

      expect(posts[0].readingTime).toBe('5 min read')
    })
  })

  describe('getPost', () => {
    it('should return specific post by slug', () => {
      const mockFiles = ['test-post.mdx', 'another-post.mdx']
      
      mockFs.readdirSync.mockReturnValue(mockFiles as any)
      mockFs.readFileSync.mockReturnValue('content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Test Post',
          description: 'Test description',
          date: '2023-12-01',
        },
        content: '# Test content',
      } as any)

      const post = getPost('test-post')

      expect(post).toBeTruthy()
      expect(post?.slug).toBe('test-post')
      expect(post?.meta.title).toBe('Test Post')
    })

    it('should return null for non-existent post', () => {
      mockFs.readdirSync.mockReturnValue(['other-post.mdx'] as any)
      mockFs.readFileSync.mockReturnValue('content')
      mockMatter.mockReturnValue({
        data: { title: 'Other', description: 'Other', date: '2023-12-01' },
        content: 'content',
      } as any)

      const post = getPost('non-existent-post')

      expect(post).toBeNull()
    })
  })

  describe('getAllProjects', () => {
    it('should return projects with related posts', () => {
      const mockProjectFiles = ['project1.mdx']
      const mockPostFiles = ['post1.mdx', 'post2.mdx']
      
      // Mock for projects directory (called by getAllProjects)
      mockFs.readdirSync.mockReturnValueOnce(mockProjectFiles as any)
      // Mock for posts directory (called by getAllPosts inside getAllProjects)  
      mockFs.readdirSync.mockReturnValueOnce(mockPostFiles as any)
      
      // Mock project content
      mockFs.readFileSync.mockReturnValueOnce('project content')
      mockMatter.mockReturnValueOnce({
        data: {
          title: 'Project 1',
          description: 'Project description',
          date: '2023-12-01',
          status: 'active',
        },
        content: '# Project content',
      } as any)
      
      // Mock post 1 content
      mockFs.readFileSync.mockReturnValueOnce('post1 content')
      mockMatter.mockReturnValueOnce({
        data: {
          title: 'Post 1',
          description: 'Post 1 desc',
          date: '2023-12-01',
          project: 'project1',
          order: 1,
        },
        content: '# Post 1',
      } as any)
      
      // Mock post 2 content  
      mockFs.readFileSync.mockReturnValueOnce('post2 content')
      mockMatter.mockReturnValueOnce({
        data: {
          title: 'Post 2',
          description: 'Post 2 desc',
          date: '2023-12-02',
          project: 'project1',
          order: 2,
        },
        content: '# Post 2',
      } as any)

      const projects = getAllProjects()

      expect(projects).toHaveLength(1)
      expect(projects[0].slug).toBe('project1')
      expect(projects[0].posts).toHaveLength(2)
      expect(projects[0].posts[0].meta.order).toBe(1)
      expect(projects[0].posts[1].meta.order).toBe(2)
    })
  })

  describe('getProject', () => {
    it('should return specific project by slug', () => {
      const mockProjectFiles = ['test-project.mdx', 'other-project.mdx']
      const mockPostFiles = []
      
      mockFs.readdirSync.mockReturnValueOnce(mockProjectFiles as any)
      mockFs.readdirSync.mockReturnValueOnce(mockPostFiles as any)
      mockFs.readFileSync.mockReturnValue('project content')
      mockMatter.mockReturnValue({
        data: {
          title: 'Test Project',
          description: 'Test project description',
          date: '2023-12-01',
          status: 'active',
        },
        content: '# Test project content',
      } as any)

      const project = getProject('test-project')

      expect(project).toBeTruthy()
      expect(project?.slug).toBe('test-project')
      expect(project?.meta.title).toBe('Test Project')
    })

    it('should return null for non-existent project', () => {
      mockFs.readdirSync.mockReturnValueOnce(['other-project.mdx'] as any)
      mockFs.readdirSync.mockReturnValueOnce([] as any)

      const project = getProject('non-existent-project')

      expect(project).toBeNull()
    })
  })
})