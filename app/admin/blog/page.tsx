"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BlogList from "@/components/BlogList";
import { Plus } from "lucide-react";

// Dynamic import to avoid SSR issues with TipTap
const BlogForm = dynamic(() => import("@/components/BlogForm"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2">Loading editor...</span>
    </div>
  ),
});

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  readTime: number;
  views: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    focusKeyword?: string;
    openGraph?: {
      title?: string;
      description?: string;
      image?: string;
      imageAlt?: string;
    };
    twitter?: {
      title?: string;
      description?: string;
      image?: string;
      imageAlt?: string;
    };
    noIndex?: boolean;
    noFollow?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogManagement() {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const handleCreateNew = () => {
    setSelectedBlog(null);
    setCurrentView('create');
  };

  const handleEdit = async (blog: Blog) => {
    try {
      setIsLoading(true);
      // Fetch complete blog data including content
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/blogs/${blog._id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedBlog(data.data);
        setCurrentView('edit');
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch blog details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (blogData: any) => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting to save blog...', {
        isEdit: !!selectedBlog,
        title: blogData.title,
        hasContent: !!blogData.content,
        hasExcerpt: !!blogData.excerpt,
        featuredImage: blogData.featuredImage,
        seoData: blogData.seo
      });

      const token = localStorage.getItem('admin_token');
      const url = selectedBlog ? `/api/blogs/${selectedBlog._id}` : '/api/blogs';
      const method = selectedBlog ? 'PUT' : 'POST';

      console.log(`📤 Making ${method} request to ${url}`);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(blogData)
      });

      console.log(`📥 Response status: ${response.status}`);

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        let message = data.message || `Blog ${selectedBlog ? 'updated' : 'created'} successfully!`;
        
        // Add email notification status to message if available
        if (data.emailNotification) {
          if (data.emailNotification.success) {
            message += ` Email notification sent to ${data.emailNotification.sent} subscribers.`;
          } else {
            message += ` Note: ${data.emailNotification.message}`;
          }
        }
        
        toast({
          title: "Success",
          description: message,
          variant: "default",
        });
        
        setCurrentView('list');
        setSelectedBlog(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        // Enhanced error handling for detailed validation messages
        let errorMessage = data.message || data.error || 'Failed to save blog';
        
        // If there are validation details, show them
        if (data.details && Array.isArray(data.details)) {
          errorMessage = `Validation Error: ${data.details.join(', ')}`;
        }
        
        console.error('Blog save error:', {
          status: response.status,
          error: data.error,
          message: data.message,
          details: data.details
        });
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to server. Please check if the server is running.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Unexpected error: Unable to save blog. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Blog deleted successfully!",
          variant: "default",
        });
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete blog",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedBlog(null);
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title={currentView === 'list' ? "Blog Management" : selectedBlog ? "Edit Blog Post" : "Create New Blog Post"}
        description={currentView === 'list' ? "Create, edit, and manage your blog posts" : currentView === 'edit' ? "Update blog post content and settings" : "Write and publish a new blog post"}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'list' ? 'Blog Posts' : selectedBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
            </div>
            {currentView === 'list' ? (
              <Button onClick={handleCreateNew} animation="ripple">
                <Plus className="mr-2 h-4 w-4" />
                Create New Blog
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCancel} animation="bounce">
                ← Back to Blog List
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {currentView === 'list' && (
          <BlogList
            onEdit={handleEdit}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <BlogForm
            blog={selectedBlog || undefined}
            onSubmit={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Processing...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
