import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, Video, Globe, Play, Pause, X } from 'lucide-react';

interface MediaLoaderProps {
  onLoadMedia: (file: File, type: 'image' | 'video') => void;
  onLoadUrl: (url: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaLoader: React.FC<MediaLoaderProps> = ({
  onLoadMedia,
  onLoadUrl,
  isOpen,
  onClose
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      if (file.type.startsWith('image/')) {
        onLoadMedia(file, 'image');
        onClose();
      } else if (file.type.startsWith('video/')) {
        onLoadMedia(file, 'video');
        onClose();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onLoadMedia(file, 'image');
        onClose();
      } else if (file.type.startsWith('video/')) {
        onLoadMedia(file, 'video');
        onClose();
      }
    }
  };

  const handleUrlSubmit = () => {
    if (customUrl) {
      onLoadUrl(customUrl);
      setCustomUrl('');
      onClose();
    }
  };

  const vrFriendlyUrls = [
    { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { name: 'MDN Docs', url: 'https://developer.mozilla.org' },
    { name: 'Archive.org', url: 'https://archive.org' },
    { name: 'CodePen', url: 'https://codepen.io' },
    { name: 'Example.com', url: 'https://example.com' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="vr-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Load VR Content</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="media" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="media">Local Media</TabsTrigger>
              <TabsTrigger value="websites">Websites</TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="space-y-4">
              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Drop your files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support: Images (JPG, PNG, GIF) and Videos (MP4, WebM)
                </p>
                <Label htmlFor="file-input">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </Label>
                <Input
                  id="file-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Label htmlFor="image-input">
                  <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer border border-border/50">
                    <div className="flex items-center space-x-3">
                      <Image className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">Load Image</h4>
                        <p className="text-sm text-muted-foreground">360° photos, panoramas</p>
                      </div>
                    </div>
                  </Card>
                </Label>
                <Input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <Label htmlFor="video-input">
                  <Card className="p-4 hover:bg-card/80 transition-colors cursor-pointer border border-border/50">
                    <div className="flex items-center space-x-3">
                      <Video className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">Load Video</h4>
                        <p className="text-sm text-muted-foreground">360° videos, movies</p>
                      </div>
                    </div>
                  </Card>
                </Label>
                <Input
                  id="video-input"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </TabsContent>

            <TabsContent value="websites" className="space-y-4">
              {/* Custom URL Input */}
              <div className="space-y-2">
                <Label>Custom Website URL</Label>
                <div className="flex space-x-2">
                  <Input
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com"
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <Button onClick={handleUrlSubmit} className="btn-vr">
                    Load
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: Some sites may not display due to security restrictions
                </p>
              </div>

              {/* VR-Friendly Sites */}
              <div>
                <Label className="mb-3 block">VR-Friendly Websites</Label>
                <div className="grid grid-cols-1 gap-2">
                  {vrFriendlyUrls.map((site) => (
                    <Card
                      key={site.url}
                      className="p-3 hover:bg-card/80 transition-colors cursor-pointer border border-border/50"
                      onClick={() => {
                        onLoadUrl(site.url);
                        onClose();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <h4 className="font-medium text-foreground">{site.name}</h4>
                          <p className="text-sm text-muted-foreground">{site.url}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">🥽 VR Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use landscape orientation for best VR experience</li>
              <li>• 360° photos/videos work best in VR mode</li>
              <li>• Adjust IPD slider for comfortable viewing</li>
              <li>• Use fullscreen mode for immersive experience</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};