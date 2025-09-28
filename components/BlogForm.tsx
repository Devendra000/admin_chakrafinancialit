'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  tags: string[];
  categories: string[];
  status: 'draft' | 'published' | 'archived';
  seo: {
    title: string;
    description: string;
    keywords: string[];
    canonicalUrl: string;
    noIndex: boolean;
    noFollow: boolean;
    openGraph: {
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    };
    twitter: {
      title: string;
      description: string;
      image: string;
      imageAlt: string;
    };
  };
}

interface BlogFormProps {
  blog?: any;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogForm({ blog, onSubmit, onCancel, isLoading = false }: BlogFormProps) {
  const categories = [
    'Accounting',
    'Technology',
    'Finance',
    'Business',
    'Investment',
    'Cryptocurrency',
    'Banking',
    'Insurance',
    'Real Estate',
    'Education',
    'News'
  ];

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    tags: [],
    categories: [],
    status: 'draft',
    seo: {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      noIndex: false,
      noFollow: false,
      openGraph: {
        title: '',
        description: '',
        image: '',
        imageAlt: ''
      },
      twitter: {
        title: '',
        description: '',
        image: '',
        imageAlt: ''
      }
    }
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  // Initialize form with blog data if editing
  useEffect(() => {
    if (blog) {
  // Only allow valid status values
  const validStatuses = ['draft', 'published', 'archived'];
  let status = blog.status;
  if (!validStatuses.includes(status)) status = 'draft';
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImage: blog.featuredImage || '',
        tags: blog.tags || [],
        categories: Array.isArray(blog.categories) ? blog.categories : (blog.category ? [blog.category] : []),
  status: status || 'draft',
        seo: blog.seo || {
          title: '',
          description: '',
          keywords: [],
          canonicalUrl: '',
          noIndex: false,
          noFollow: false,
          openGraph: {
            title: '',
            description: '',
            image: '',
            imageAlt: ''
          },
          twitter: {
            title: '',
            description: '',
            image: '',
            imageAlt: ''
          }
        }
      });
      // If editing and has categories, start on meta tab if content is complete
      if (blog.categories && blog.categories.length > 0 && blog.title && blog.content) {
        setActiveTab('meta');
      }
    }
  }, [blog]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !blog) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, blog]);

  // Debug: log status whenever it changes (helps verify status is pre-selected when editing)
  // Keep previous status for diagnostics and auto-repair if it becomes invalid/empty
  const prevStatusRef = React.useRef<BlogFormData['status'] | null>(null);
  useEffect(() => {
    const prev = prevStatusRef.current;
    // Use console.trace to capture where the change originated in the call stack
    console.trace('[BlogForm] status changed ->', formData.status, { previous: prev });

    // If status becomes falsy (empty string / undefined / null), attempt to restore previous valid status
    if (!formData.status) {
      const validStatuses = ['draft', 'published', 'archived'] as const;
      const restore = prev && (validStatuses.includes(prev) ? prev : 'draft');
      console.warn('[BlogForm] status became empty — restoring to', restore);
      setFormData(prevState => ({ ...prevState, status: restore as BlogFormData['status'] }));
    } else {
      prevStatusRef.current = formData.status;
    }
  }, [formData.status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const canProceedToMeta = () => {
    return formData.title.trim() && formData.content.trim();
  };

  const canSubmitBlog = () => {
    return formData.title.trim() && formData.content.trim() && formData.categories.length > 0;
  };

  const handleNextToMeta = () => {
    if (canProceedToMeta()) {
      setActiveTab('meta');
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      // Split by comma and clean up each tag
      const tagsToAdd = newTag
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag && !formData.tags.includes(tag));
      
      if (tagsToAdd.length > 0) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, ...tagsToAdd] }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      // Split by comma and clean up each keyword
      const keywordsToAdd = newKeyword
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword && !formData.seo?.keywords.includes(keyword));
      
      if (keywordsToAdd.length > 0) {
        setFormData(prev => ({
          ...prev,
          seo: { ...prev.seo, keywords: [...prev.seo?.keywords, ...keywordsToAdd] }
        }));
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo?.keywords.filter(keyword => keyword !== keywordToRemove)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{blog ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
            {uploadError && (
              <div className="text-red-600 text-sm">{uploadError}</div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="meta">Meta Data</TabsTrigger>
                  <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter blog title"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => 
                        setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="lg:col-span-2">
                      <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the blog post"
                        rows={3}
                        className="mt-1 resize-none"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-sm font-medium">Featured Image</Label>
                      <ImageUpload
                        value={formData.featuredImage}
                        onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
                        onError={setUploadError}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-sm font-medium">Content *</Label>
                      <div className="mt-1">
                        <RichTextEditor
                          value={formData.content}
                          onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                          placeholder="Write your blog content here..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Button for Content Tab */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="button" 
                      onClick={handleNextToMeta}
                      disabled={!canProceedToMeta()}
                      animation="ripple"
                    >
                      Next: Add Categories →
                    </Button>
                  </div>
                </TabsContent>

                {/* Meta Data Tab */}
                <TabsContent value="meta" className="space-y-6 overflow-x-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tags Section */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add tags (separate with commas: tag1, tag2, tag3)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Categories Section */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Categories *</CardTitle>
                        {formData.categories.length === 0 && (
                          <p className="text-sm text-red-500">Please select at least one category to continue</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Select onValueChange={(value) => {
                          if (value && !formData.categories.includes(value)) {
                            setFormData(prev => ({ ...prev, categories: [...prev.categories, value] }));
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter(category => !formData.categories.includes(category))
                              .map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))
                            }
                            {categories.filter(category => !formData.categories.includes(category)).length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                All available categories have been selected
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2">
                          {formData.categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {category}
                              <button
                                type="button"
                                onClick={() => removeCategory(category)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* SEO Settings Tab */}
                <TabsContent value="seo" className="space-y-6 overflow-x-hidden">
                  {/* Basic SEO Settings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-600">Basic SEO</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="seoTitle" className="text-sm font-medium">SEO Title</Label>
                        <Input
                          id="seoTitle"
                          value={formData.seo?.title}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, title: e.target.value }
                          }))}
                          placeholder="Leave empty to use main title"
                          maxLength={60}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.seo?.title?.length}/60 characters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="seoDescription" className="text-sm font-medium">Meta Description</Label>
                        <Textarea
                          id="seoDescription"
                          value={formData.seo?.description}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, description: e.target.value }
                          }))}
                          rows={3}
                          placeholder="Leave empty to use excerpt"
                          maxLength={160}
                          className="mt-1 resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.seo?.description?.length}/160 characters
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Keywords</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Add keywords (separate with commas: keyword1, keyword2)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          />
                          <Button type="button" onClick={addKeyword} size="sm">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.seo?.keywords?.map((keyword, index) => (
                            <Badge key={index} variant="default" className="flex items-center gap-1">
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 hover:text-red-300"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="canonicalUrl" className="text-sm font-medium">Canonical URL</Label>
                        <Input
                          id="canonicalUrl"
                          value={formData.seo?.canonicalUrl}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, canonicalUrl: e.target.value }
                          }))}
                          placeholder="https://example.com/blog/post-url"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Open Graph Settings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-600">Open Graph (Social Media)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={formData.seo?.openGraph.title}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            openGraph: { ...prev.seo?.openGraph, title: e.target.value }
                          }
                        }))}
                        placeholder="Open Graph title (leave empty to use main title)"
                        maxLength={95}
                      />
                      
                      <Textarea
                        value={formData.seo?.openGraph.description}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            openGraph: { ...prev.seo?.openGraph, description: e.target.value }
                          }
                        }))}
                        rows={2}
                        placeholder="Open Graph description (leave empty to use excerpt)"
                        maxLength={300}
                        className="resize-none"
                      />
                      
                      <ImageUpload
                        value={formData.seo?.openGraph.image}
                        onChange={(url) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            openGraph: { ...prev.seo?.openGraph, image: url }
                          }
                        }))}
                        onError={setUploadError}
                        label="Open Graph Image (leave empty to use featured image)"
                      />
                      
                      <Input
                        value={formData.seo?.openGraph.imageAlt}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            openGraph: { ...prev.seo?.openGraph, imageAlt: e.target.value }
                          }
                        }))}
                        placeholder="Image alt text"
                      />
                    </CardContent>
                  </Card>

                  {/* Twitter Card Settings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-cyan-600">Twitter Card</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={formData.seo?.twitter.title}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            twitter: { ...prev.seo?.twitter, title: e.target.value }
                          }
                        }))}
                        placeholder="Twitter title (leave empty to use main title)"
                        maxLength={70}
                      />
                      
                      <Textarea
                        value={formData.seo?.twitter.description}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            twitter: { ...prev.seo?.twitter, description: e.target.value }
                          }
                        }))}
                        rows={2}
                        placeholder="Twitter description (leave empty to use excerpt)"
                        maxLength={200}
                        className="resize-none"
                      />
                      
                      <ImageUpload
                        value={formData.seo?.twitter.image}
                        onChange={(url) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            twitter: { ...prev.seo?.twitter, image: url }
                          }
                        }))}
                        onError={setUploadError}
                        label="Twitter Image (leave empty to use featured image)"
                      />
                      
                      <Input
                        value={formData.seo?.twitter.imageAlt}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            twitter: { ...prev.seo?.twitter, imageAlt: e.target.value }
                          }
                        }))}
                        placeholder="Twitter image alt text"
                      />
                    </CardContent>
                  </Card>

                  {/* SEO Control Settings */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-600">SEO Control</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noIndex"
                          checked={formData.seo?.noIndex}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, noIndex: !!checked }
                          }))}
                        />
                        <Label htmlFor="noIndex" className="text-sm">
                          No Index (prevent search engines from indexing this page)
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noFollow"
                          checked={formData.seo?.noFollow}
                          onCheckedChange={(checked) => setFormData(prev => ({
                            ...prev,
                            seo: { ...prev.seo, noFollow: !!checked }
                          }))}
                        />
                        <Label htmlFor="noFollow" className="text-sm">
                          No Follow (prevent search engines from following links on this page)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Form Actions - Only show on meta and seo tabs */}
              {(activeTab === 'meta' || activeTab === 'seo') && (
                <div className="flex justify-end gap-4 pt-6">
                  {activeTab === 'meta' && (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab('content')}
                        animation="bounce"
                      >
                        ← Back to Content
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setActiveTab('seo')}
                        animation="ripple"
                      >
                        Next: SEO Settings →
                      </Button>
                    </>
                  )}
                  {activeTab === 'seo' && (
                    <>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setActiveTab('meta')}
                        animation="bounce"
                      >
                        ← Back to Meta Data
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !canSubmitBlog()} 
                        loading={isLoading} 
                        animation="glow"
                      >
                        {blog ? 'Update Blog' : 'Create Blog'}
                      </Button>
                      <Button type="button" variant="outline" onClick={onCancel} animation="bounce">
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BlogForm;