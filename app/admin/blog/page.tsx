"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BlogForm from "@/components/BlogForm";
import { Search, Plus, Edit, Trash2, Calendar, User, Eye } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  featuredImage: string;
  isPublished: boolean;
  isFeatured: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
  readTime: number;
  createdAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory === "all" ? "" : selectedCategory,
        limit: "50"
      });
      
      const response = await fetch(`/api/blogs?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setBlogs(result.data.blogs || []);
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, selectedCategory]);

  const handleCreateBlog = async (blogData: any) => {
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setBlogs([result.data, ...blogs]);
        setShowBlogForm(false);
        setEditingBlog(null);
        return { success: true };
      } else {
        return { success: false, error: result.error || "Failed to create blog" };
      }
    } catch {
      return { success: false, error: "Failed to create blog" };
    }
  };

  const handleEditBlog = async (blogData: any) => {
    try {
      const res = await fetch(`/api/blogs/${blogData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setBlogs(blogs.map(blog => (blog._id === blogData._id ? result.data : blog)));
        setShowBlogForm(false);
        setEditingBlog(null);
        return { success: true };
      } else {
        return { success: false, error: result.error || "Failed to update blog" };
      }
    } catch {
      return { success: false, error: "Failed to update blog" };
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });
      
      const result = await res.json();
      
      if (result.success) {
        setBlogs(blogs.filter(blog => blog._id !== blogId));
      } else {
        alert("Failed to delete blog: " + result.error);
      }
    } catch {
      alert("Failed to delete blog");
    }
  };

  const handleSubmit = editingBlog ? handleEditBlog : handleCreateBlog;

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (showBlogForm) {
    return (
      <div className="flex flex-col h-full">
        <AdminHeader 
          title={editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
          description={editingBlog ? "Update blog post content and settings" : "Write and publish a new blog post"}
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBlogForm(false);
                setEditingBlog(null);
              }}
            >
              ← Back to Blog List
            </Button>
          </div>
          
          <BlogForm
            blog={editingBlog || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowBlogForm(false);
              setEditingBlog(null);
            }}
            isLoading={loading}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Blog Management" description="Create and manage your blog content" />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Blog Posts</h2>
          <Button onClick={() => setShowBlogForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Blog Post
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Blog Table */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading blog posts...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium line-clamp-1">{blog.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {blog.readTime} min read
                          </span>
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {blog.author.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{blog.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.isPublished ? "default" : "secondary"}>
                        {blog.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {blog.isFeatured && (
                        <Badge variant="outline" className="ml-2">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingBlog(blog);
                            setShowBlogForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteBlog(blog._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredBlogs.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="max-w-sm mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search criteria."
                    : "Get started by creating your first blog post."
                  }
                </p>
                {(!searchTerm && selectedCategory === "all") && (
                  <Button onClick={() => setShowBlogForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Blog Post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
