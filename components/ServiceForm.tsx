'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';

interface Service {
  _id?: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  highlights: string[];
  packages: {
    Basic: { price: string; features: string[]; recommended: boolean };
    Standard: { price: string; features: string[]; recommended: boolean };
    Premium: { price: string; features: string[]; recommended: boolean };
  };
  isActive: boolean;
  createdAt?: string;
}

interface ServiceFormProps {
  service?: Service;
  onSubmit: (service: Service) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ServiceForm({ service, onSubmit, onCancel, isLoading }: ServiceFormProps) {
  const [formData, setFormData] = useState<Service>({
    title: service?.title || '',
    description: service?.description || '',
    shortDescription: service?.shortDescription || '',
    category: service?.category || '',
    tags: service?.tags || [],
    highlights: service?.highlights || [''],
    packages: service?.packages || {
      Basic: { price: '', features: [''], recommended: false },
      Standard: { price: '', features: [''], recommended: false },
      Premium: { price: '', features: [''], recommended: false }
    },
    isActive: service?.isActive ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cleanedData:any = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
        highlights: formData.highlights.filter(h => h.trim()),
        packages: Object.fromEntries(
          Object.entries(formData.packages).map(([name, pkg]) => [
            name,
            { ...pkg, features: pkg.features.filter(f => f.trim()) }
          ])
        )
      };
      
      if (service?._id) {
        cleanedData._id = service._id;
      }
      
      onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const removeHighlight = (index: number) => {
    if (formData.highlights.length > 1) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights.filter((_, i) => i !== index)
      }));
    }
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => i === index ? value : h)
    }));
  };

  const addPackageFeature = (packageName: keyof typeof formData.packages) => {
    setFormData(prev => ({
      ...prev,
      packages: {
        ...prev.packages,
        [packageName]: {
          ...prev.packages[packageName],
          features: [...prev.packages[packageName].features, '']
        }
      }
    }));
  };

  const removePackageFeature = (packageName: keyof typeof formData.packages, index: number) => {
    if (formData.packages[packageName].features.length > 1) {
      setFormData(prev => ({
        ...prev,
        packages: {
          ...prev.packages,
          [packageName]: {
            ...prev.packages[packageName],
            features: prev.packages[packageName].features.filter((_, i) => i !== index)
          }
        }
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{service ? 'Edit Service' : 'Create New Service'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div>
            <Label>Service Highlights</Label>
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={highlight}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  placeholder="Enter highlight"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeHighlight(index)}
                  disabled={formData.highlights.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHighlight}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Highlight
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active Service</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Basic">Basic</TabsTrigger>
              <TabsTrigger value="Standard">Standard</TabsTrigger>
              <TabsTrigger value="Premium">Premium</TabsTrigger>
            </TabsList>

            {(['Basic', 'Standard', 'Premium'] as const).map((packageName) => (
              <TabsContent key={packageName} value={packageName} className="space-y-4">
                <div>
                  <Label htmlFor={`${packageName}-price`}>Price</Label>
                  <Input
                    id={`${packageName}-price`}
                    value={formData.packages[packageName].price}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      packages: {
                        ...prev.packages,
                        [packageName]: {
                          ...prev.packages[packageName],
                          price: e.target.value
                        }
                      }
                    }))}
                    placeholder="e.g., $99/month"
                  />
                </div>

                <div>
                  <Label>Features</Label>
                  {formData.packages[packageName].features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={feature}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            packages: {
                              ...prev.packages,
                              [packageName]: {
                                ...prev.packages[packageName],
                                features: prev.packages[packageName].features.map((f, i) => 
                                  i === index ? e.target.value : f
                                )
                              }
                            }
                          }));
                        }}
                        placeholder="Enter feature"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePackageFeature(packageName, index)}
                        disabled={formData.packages[packageName].features.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPackageFeature(packageName)}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${packageName}-recommended`}
                    checked={formData.packages[packageName].recommended}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      packages: {
                        ...prev.packages,
                        [packageName]: {
                          ...prev.packages[packageName],
                          recommended: checked
                        }
                      }
                    }))}
                  />
                  <Label htmlFor={`${packageName}-recommended`}>Recommended Package</Label>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
