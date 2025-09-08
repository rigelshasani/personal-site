import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostEditor } from '@/components/PostEditor'
import { PostMeta } from '@/lib/content'

describe('PostEditor', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with empty form by default', () => {
    render(<PostEditor {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Enter post title')).toHaveValue('')
    expect(screen.getByPlaceholderText('Enter post description')).toHaveValue('')
    expect(screen.getByTestId('monaco-editor')).toHaveValue('')
  })

  it('should render with initial values when provided', () => {
    render(
      <PostEditor
        {...defaultProps}
        initialTitle="Test Post"
        initialDescription="Test description"
        initialContent="# Test content"
        initialTags={['test', 'jest']}
        initialProject="test-project"
        initialOrder={1}
      />
    )
    
    expect(screen.getByDisplayValue('Test Post')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test, jest')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    const user = userEvent.setup()
    render(<PostEditor {...defaultProps} />)
    
    const titleInput = screen.getByPlaceholderText('Enter post title')
    const descriptionInput = screen.getByPlaceholderText('Enter post description')
    
    await user.type(titleInput, 'New Post Title')
    await user.type(descriptionInput, 'New post description')
    
    expect(titleInput).toHaveValue('New Post Title')
    expect(descriptionInput).toHaveValue('New post description')
  })

  it('should handle tags input correctly', async () => {
    const user = userEvent.setup()
    render(<PostEditor {...defaultProps} />)
    
    const tagsInput = screen.getByPlaceholderText('tag1, tag2, tag3')
    await user.type(tagsInput, 'react, testing, jest')
    
    expect(tagsInput).toHaveValue('react, testing, jest')
  })

  it('should toggle between edit and preview modes', async () => {
    const user = userEvent.setup()
    render(<PostEditor {...defaultProps} />)
    
    const previewButton = screen.getByRole('button', { name: 'Preview' })
    const editButton = screen.getByRole('button', { name: 'Edit' })
    
    // Initially in edit mode
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
    
    // Switch to preview mode
    await user.click(previewButton)
    expect(screen.queryByTestId('monaco-editor')).not.toBeInTheDocument()
    
    // Switch back to edit mode
    await user.click(editButton)
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('should call onSave with correct data when save button clicked', async () => {
    const user = userEvent.setup()
    const mockSave = jest.fn()
    
    render(<PostEditor {...defaultProps} onSave={mockSave} />)
    
    // Fill in required fields
    await user.type(screen.getByPlaceholderText('Enter post title'), 'Test Title')
    await user.type(screen.getByPlaceholderText('Enter post description'), 'Test description')
    
    const editor = screen.getByTestId('monaco-editor')
    fireEvent.change(editor, { target: { value: '# Test content' } })
    
    const saveButton = screen.getByRole('button', { name: 'Create Post' })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          description: 'Test description',
        }),
        '# Test content'
      )
    })
  })

  it('should show validation error for empty required fields', async () => {
    const user = userEvent.setup()
    const mockSave = jest.fn()
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<PostEditor {...defaultProps} onSave={mockSave} />)
    
    const saveButton = screen.getByRole('button', { name: 'Create Post' })
    await user.click(saveButton)
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all required fields')
    expect(mockSave).not.toHaveBeenCalled()
    
    alertSpy.mockRestore()
  })

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    const mockCancel = jest.fn()
    
    render(<PostEditor {...defaultProps} onCancel={mockCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    
    expect(mockCancel).toHaveBeenCalled()
  })

  it('should show loading state when saving', async () => {
    const user = userEvent.setup()
    const mockSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<PostEditor {...defaultProps} onSave={mockSave} />)
    
    // Fill required fields
    await user.type(screen.getByPlaceholderText('Enter post title'), 'Test')
    await user.type(screen.getByPlaceholderText('Enter post description'), 'Test desc')
    
    const editor = screen.getByTestId('monaco-editor')
    fireEvent.change(editor, { target: { value: 'content' } })
    
    const saveButton = screen.getByRole('button', { name: 'Create Post' })
    await user.click(saveButton)
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
  })

  it('should display correct button text for editing mode', () => {
    render(<PostEditor {...defaultProps} isEditing={true} />)
    
    expect(screen.getByRole('button', { name: 'Update Post' })).toBeInTheDocument()
  })
})