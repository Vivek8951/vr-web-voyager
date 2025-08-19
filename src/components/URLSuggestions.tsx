import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Gamepad2, BookOpen, Music } from 'lucide-react';

interface URLSuggestionsProps {
  onSelectUrl: (url: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const URLSuggestions: React.FC<URLSuggestionsProps> = ({ 
  onSelectUrl, 
  isVisible, 
  onClose 
}) => {
  const suggestions = [
    {
      category: 'VR-Friendly Sites',
      icon: <Globe className="w-4 h-4" />,
      sites: [
        { name: 'Example.com', url: 'https://example.com', description: 'Simple test page' },
        { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Developer resources' },
        { name: 'Wikipedia', url: 'https://en.wikipedia.org', description: 'Encyclopedia' },
        { name: 'Archive.org', url: 'https://archive.org', description: 'Internet archive' }
      ]
    },
    {
      category: 'Interactive Content',
      icon: <Gamepad2 className="w-4 h-4" />,
      sites: [
        { name: 'CodePen', url: 'https://codepen.io', description: 'Code playground' },
        { name: 'JSFiddle', url: 'https://jsfiddle.net', description: 'Online IDE' },
        { name: 'Khan Academy', url: 'https://www.khanacademy.org', description: 'Educational content' }
      ]
    },
    {
      category: 'Media & Entertainment',
      icon: <Music className="w-4 h-4" />,
      sites: [
        { name: 'Internet Archive Books', url: 'https://openlibrary.org', description: 'Free books' },
        { name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org', description: 'Free media' }
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="vr-panel w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">VR-Friendly Websites</h2>
              <p className="text-sm text-muted-foreground">
                Many sites block iframe embedding. Try these VR-compatible alternatives:
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {suggestions.map((category) => (
              <div key={category.category}>
                <div className="flex items-center space-x-2 mb-3">
                  {category.icon}
                  <h3 className="font-semibold text-foreground">{category.category}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.sites.map((site) => (
                    <Card 
                      key={site.url}
                      className="p-4 hover:bg-card/80 transition-colors cursor-pointer border border-border/50"
                      onClick={() => {
                        onSelectUrl(site.url);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-foreground">{site.name}</h4>
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {site.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {new URL(site.url).hostname}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Sites like Google, Facebook, and YouTube block iframe embedding for security. 
              The above sites are tested to work well in VR mode!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};