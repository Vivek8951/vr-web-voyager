import React, { useState, useEffect } from 'react';

interface WebsiteRenderer {
  url: string;
  onImageGenerated: (imageUrl: string) => void;
}

export const WebsiteScreenshot: React.FC<WebsiteRenderer> = ({ url, onImageGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Alternative approach: Create a visual representation of the website
  useEffect(() => {
    if (!url) return;

    setIsLoading(true);
    
    // Create a canvas representation of the website
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f172a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add grid pattern
      ctx.strokeStyle = '#00ffff20';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Add website info
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VR Web Browser', canvas.width / 2, 200);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '32px Arial';
      ctx.fillText(`Loading: ${url}`, canvas.width / 2, 280);
      
      // Add VR-like interface elements
      ctx.fillStyle = '#00ffff40';
      ctx.fillRect(100, 400, canvas.width - 200, 400);
      
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 400, canvas.width - 200, 400);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('Website content will appear here', canvas.width / 2, 600);
      ctx.fillText('Some sites may not load due to CORS restrictions', canvas.width / 2, 640);
      ctx.fillText('Try the VR-friendly sites from the media loader', canvas.width / 2, 680);

      // Add floating elements
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 10 + 5;
        
        ctx.fillStyle = '#00ffff60';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          onImageGenerated(imageUrl);
        }
        setIsLoading(false);
      });
    }
  }, [url, onImageGenerated]);

  return null; // This component doesn't render anything visible
};

// Alternative: Embed iframe with error handling
export const WebsiteIframe: React.FC<{ 
  url: string; 
  onError: () => void;
  className?: string;
}> = ({ url, onError, className }) => {
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      // Try to access the iframe content
      const iframe = e.currentTarget;
      iframe.contentWindow?.document;
    } catch (error) {
      setHasError(true);
      onError();
    }
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Site Blocked
          </h3>
          <p className="text-sm text-muted-foreground">
            This website blocks embedding. Try VR-friendly sites instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      sandbox="allow-same-origin allow-scripts allow-forms allow-navigation"
      title="VR Website View"
    />
  );
};