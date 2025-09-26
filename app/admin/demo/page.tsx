"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Star, Heart, Zap, Sparkles, Rocket } from "lucide-react";

export default function ButtonDemoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleAction = (type: 'success' | 'error' | 'loading') => {
    if (type === 'loading') {
      setLoading(true);
      setTimeout(() => setLoading(false), 3000);
    } else if (type === 'success') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } else if (type === 'error') {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="Button Animation Demo" 
        description="Interactive demonstration of all button animation types and states"
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Basic Animations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Basic Button Animations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Default (Scale on Click)</p>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Default Animation
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ripple Effect</p>
                  <Button animation="ripple" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Ripple Effect
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Glow on Hover</p>
                  <Button animation="glow" className="w-full">
                    <Star className="mr-2 h-4 w-4" />
                    Glow Animation
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Bounce on Hover</p>
                  <Button animation="bounce" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    Bounce Animation
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pulse on Hover</p>
                  <Button animation="pulse" className="w-full">
                    <Rocket className="mr-2 h-4 w-4" />
                    Pulse Animation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State-Based Animations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                State-Based Animations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Loading State</p>
                  <Button 
                    className="w-full" 
                    loading={loading}
                    onClick={() => handleAction('loading')}
                  >
                    {loading ? 'Processing...' : 'Test Loading'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Success State</p>
                  <Button 
                    className="w-full" 
                    success={success}
                    onClick={() => handleAction('success')}
                  >
                    Test Success
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Error State</p>
                  <Button 
                    className="w-full"
                    variant="destructive"
                    error={error}
                    onClick={() => handleAction('error')}
                  >
                    Test Error
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variant Combinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Variant + Animation Combinations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="default" animation="glow" className="w-full">
                  Primary + Glow
                </Button>
                
                <Button variant="outline" animation="ripple" className="w-full">
                  Outline + Ripple
                </Button>
                
                <Button variant="secondary" animation="bounce" className="w-full">
                  Secondary + Bounce
                </Button>
                
                <Button variant="ghost" animation="pulse" className="w-full">
                  Ghost + Pulse
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Size Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Different Sizes with Animations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm" animation="ripple">
                  Small Button
                </Button>
                
                <Button size="default" animation="glow">
                  Default Size
                </Button>
                
                <Button size="lg" animation="bounce">
                  Large Button
                </Button>
                
                <Button size="icon" animation="pulse">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use Button Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <p className="text-sm text-muted-foreground mb-4">
                  Add the <code>animation</code> prop to any Button component to enable animations:
                </p>
                
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                  <div>{`<Button animation="ripple">Click me</Button>`}</div>
                  <div>{`<Button animation="glow" variant="outline">Glow effect</Button>`}</div>
                  <div>{`<Button loading={isLoading}>Submit</Button>`}</div>
                  <div>{`<Button success={showSuccess}>Save</Button>`}</div>
                  <div>{`<Button error={hasError} variant="destructive">Delete</Button>`}</div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Available animations:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code>ripple</code> - Creates a ripple effect from click point</li>
                    <li>• <code>glow</code> - Adds a glowing shadow on hover and click</li>
                    <li>• <code>bounce</code> - Bounces the button on hover</li>
                    <li>• <code>pulse</code> - Pulses the button on hover</li>
                    <li>• <code>none</code> - Disables animations (default scale effect remains)</li>
                  </ul>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">State props:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <code>loading</code> - Shows spinner and disables interaction</li>
                    <li>• <code>success</code> - Triggers success bounce animation</li>
                    <li>• <code>error</code> - Triggers error shake animation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}