'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });
import { PostMeta } from '@/lib/content';
import { useToast } from '@/components/Toast';
import ReactMarkdown from 'react-markdown';
import { generateSlug } from '@/lib/slug';

interface PostEditorProps {
  initialTitle?: string;
  initialDescription?: string;
  initialContent?: string;
  initialTags?: string[];
  initialProject?: string;
  initialOrder?: number;
  initialDate?: string;
  initialFeatured?: boolean;
  onSave: (meta: PostMeta, content: string) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function PostEditor({
  initialTitle = '',
  initialDescription = '',
  initialContent = '',
  initialTags = [],
  initialProject = '',
  initialOrder,
  initialDate,
  initialFeatured,
  onSave,
  onCancel,
  isEditing = false,
}: PostEditorProps) {
  const [meta, setMeta] = useState<PostMeta>({
    title: initialTitle,
    description: initialDescription,
    date: initialDate ?? new Date().toISOString().split('T')[0],
    tags: initialTags,
    project: initialProject || undefined,
    order: initialOrder,
    featured: initialFeatured,
  });
  
  const [content, setContent] = useState(initialContent);
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '));
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [projects, setProjects] = useState<{ slug: string; title: string }[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/admin/projects/list')
      .then((r) => r.json())
      .then((d) => { if (d.projects) setProjects(d.projects); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleMetaChange = <K extends keyof PostMeta>(field: K, value: PostMeta[K]) => {
    setMeta(prev => ({ ...prev, [field]: value } as PostMeta));
    setIsDirty(true);
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setMeta(prev => ({ ...prev, tags }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!meta.title.trim() || !meta.description.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(meta, content);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error('Failed to save post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata Form */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Post Metadata
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => handleMetaChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter post title"
            />
            {!isEditing && meta.title && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL: <span className="font-mono">/posts/{generateSlug(meta.title)}</span>
              </p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={meta.description}
              onChange={(e) => handleMetaChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter post description"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => handleMetaChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="tag1, tag2, tag3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project (optional)
            </label>
            <select
              value={meta.project || ''}
              onChange={(e) => handleMetaChange('project', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">— None —</option>
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="featured"
              checked={meta.featured ?? false}
              onChange={(e) => handleMetaChange('featured', e.target.checked || undefined)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Featured post
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order (optional)
            </label>
            <input
              type="number"
              value={typeof meta.order === 'number' ? String(meta.order) : ''}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  handleMetaChange('order', undefined);
                } else {
                  const parsed = parseInt(v, 10);
                  handleMetaChange('order', Number.isNaN(parsed) ? undefined : parsed);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="1"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Content *
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode(false)}
              className={`px-3 py-1 text-sm rounded ${
                !previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`px-3 py-1 text-sm rounded ${
                previewMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
        
        <div className="h-96">
          {previewMode ? (
            <div className="h-full overflow-auto p-6 prose dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={content}
              onChange={(value) => { setContent(value || ''); setIsDirty(true); }}
              data-testid="monaco-editor"
              theme={isDark ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md shadow-sm"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
        </button>
      </div>
    </div>
  );
}
