import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, X, ExternalLink } from 'lucide-react';

interface HistoryItem {
  url: string;
  title: string;
  timestamp: Date;
  favicon?: string;
}

interface BrowserHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const BrowserHistory: React.FC<BrowserHistoryProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('vr-browser-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to parse browser history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vr-browser-history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (url: string, title?: string) => {
    const newItem: HistoryItem = {
      url,
      title: title || new URL(url).hostname,
      timestamp: new Date()
    };

    setHistory(prev => {
      // Remove duplicates and add to front
      const filtered = prev.filter(item => item.url !== url);
      return [newItem, ...filtered].slice(0, 50); // Keep only last 50 items
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('vr-browser-history');
  };

  const handleNavigate = (url: string) => {
    onNavigate(url);
    onClose();
  };

  // Expose addToHistory method globally for the main component
  useEffect(() => {
    (window as any).addToVRHistory = addToHistory;
    return () => {
      delete (window as any).addToVRHistory;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="vr-panel w-full max-w-2xl max-h-[80vh]">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Browser History</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-96 p-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No browsing history yet</p>
              <p className="text-sm">Visit some websites to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-border/30 hover:bg-card/80 transition-colors cursor-pointer group"
                  onClick={() => handleNavigate(item.url)}
                >
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.url}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHistory(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};