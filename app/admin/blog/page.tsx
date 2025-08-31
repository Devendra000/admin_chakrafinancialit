"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  category: string
  tags: string[]
  status: "draft" | "published" | "archived"
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  readTime: string
  views: number
}

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Understanding Investment Strategies for 2024",
    excerpt: "A comprehensive guide to modern investment approaches and portfolio diversification strategies.",
    content: "Investment strategies have evolved significantly in recent years...",
    author: "Sarah Johnson",
    category: "Investment",
    tags: ["investment", "portfolio", "strategy"],
    status: "published",
    publishedAt: "2024-01-15",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    readTime: "8 min read",
    views: 1247,
  },
  {
    id: "2",
    title: "Tax Planning Tips for Small Businesses",
    excerpt: "Essential tax strategies every small business owner should know to maximize deductions.",
    content: "Small business tax planning requires careful consideration...",
    author: "Michael Chen",
    category: "Tax",
    tags: ["tax", "business", "planning"],
    status: "published",
    publishedAt: "2024-01-12",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-12",
    readTime: "6 min read",
    views: 892,
  },
  {
    id: "3",
    title: "Retirement Planning in Your 30s",
    excerpt: "Why starting early with retirement planning can make a significant difference in your future.",
    content: "Retirement planning in your 30s is crucial for long-term financial security...",
    author: "Emily Rodriguez",
    category: "Retirement",
    tags: ["retirement", "planning", "savings"],
    status: "draft",
    publishedAt: null,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-08",
    readTime: "5 min read",
    views: 0,
  },
]

const categories = ["Investment", "Tax", "Retirement", "Business", "Insurance", "Estate Planning", "Market Analysis"]
const authors = ["Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Kim", "Lisa Thompson"]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "",
    tags: "",
    status: "draft" as "draft" | "published" | "archived",
  })

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddPost = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      category: formData.category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      status: formData.status,
      publishedAt: formData.status === "published" ? new Date().toISOString().split("T")[0] : null,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      readTime: `${Math.ceil(formData.content.split(" ").length / 200)} min read`,
      views: 0,
    }
    setPosts([newPost, ...posts])
    setFormData({ title: "", excerpt: "", content: "", author: "", category: "", tags: "", status: "draft" })
    setIsAddDialogOpen(false)
  }

  const handleEditPost = () => {
    if (!editingPost) return
    const updatedPost: BlogPost = {
      ...editingPost,
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      category: formData.category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      status: formData.status,
      publishedAt:
        formData.status === "published" && !editingPost.publishedAt
          ? new Date().toISOString().split("T")[0]
          : editingPost.publishedAt,
      updatedAt: new Date().toISOString().split("T")[0],
      readTime: `${Math.ceil(formData.content.split(" ").length / 200)} min read`,
    }
    setPosts(posts.map((post) => (post.id === editingPost.id ? updatedPost : post)))
    setEditingPost(null)
    setFormData({ title: "", excerpt: "", content: "", author: "", category: "", tags: "", status: "draft" })
  }

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id))
  }

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: post.tags.join(", "),
      status: post.status,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "draft":
        return "secondary"
      case "archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Blog Management" description="Create and manage your blog content" />

      <main className="flex-1 p-6 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage your blog content and publications</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Blog Post</DialogTitle>
                    <DialogDescription>Write and publish a new blog post</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content" className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter blog post title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                          placeholder="Brief description of the post"
                          rows={2}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Write your blog post content here..."
                          rows={10}
                          className="min-h-[200px]"
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="settings" className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="author">Author</Label>
                        <Select
                          value={formData.author}
                          onValueChange={(value) => setFormData({ ...formData, author: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select author" />
                          </SelectTrigger>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author} value={author}>
                                {author}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="Enter tags separated by commas"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "draft" | "published" | "archived") =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddPost}>Create Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posts Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium line-clamp-1">{post.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</div>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {post.readTime}
                            </span>
                            {post.tags.slice(0, 2).map((tag) => (
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
                          {post.author}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>{post.views.toLocaleString()}</TableCell>
                      <TableCell>{post.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog
                            open={editingPost?.id === post.id}
                            onOpenChange={(open) => !open && setEditingPost(null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Blog Post</DialogTitle>
                                <DialogDescription>Update your blog post content and settings</DialogDescription>
                              </DialogHeader>
                              <Tabs defaultValue="content" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="content">Content</TabsTrigger>
                                  <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>
                                <TabsContent value="content" className="space-y-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-title">Title</Label>
                                    <Input
                                      id="edit-title"
                                      value={formData.title}
                                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-excerpt">Excerpt</Label>
                                    <Textarea
                                      id="edit-excerpt"
                                      value={formData.excerpt}
                                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                      rows={2}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-content">Content</Label>
                                    <Textarea
                                      id="edit-content"
                                      value={formData.content}
                                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                      rows={10}
                                      className="min-h-[200px]"
                                    />
                                  </div>
                                </TabsContent>
                                <TabsContent value="settings" className="space-y-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-author">Author</Label>
                                    <Select
                                      value={formData.author}
                                      onValueChange={(value) => setFormData({ ...formData, author: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {authors.map((author) => (
                                          <SelectItem key={author} value={author}>
                                            {author}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                      value={formData.category}
                                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {category}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-tags">Tags</Label>
                                    <Input
                                      id="edit-tags"
                                      value={formData.tags}
                                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select
                                      value={formData.status}
                                      onValueChange={(value: "draft" | "published" | "archived") =>
                                        setFormData({ ...formData, status: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TabsContent>
                              </Tabs>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingPost(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditPost}>Update Post</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
