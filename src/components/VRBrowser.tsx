import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { BrowserHistory } from '@/components/BrowserHistory';
import { URLSuggestions } from '@/components/URLSuggestions';
import { MediaLoader } from '@/components/MediaLoader';
import { VRScene3D } from '@/components/VRScene3D';
import { 
  RotateCcw, 
  RotateCw, 
  RefreshCw, 
  Home, 
  ZoomIn, 
  ZoomOut, 
  Move3D,
  Eye,
  Settings,
  Maximize,
  ArrowLeft,
  ArrowRight,
  History,
  Moon,
  Sun,
  Globe,
  Upload,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';

interface VRBrowserProps {}

export const VRBrowser: React.FC<VRBrowserProps> = () => {
  const [url, setUrl] = useState('https://example.com');
  const [isVRMode, setIsVRMode] = useState(false);
  const [zoom, setZoom] = useState([100]);
  const [distance, setDistance] = useState([50]);
  const [ipd, setIpd] = useState([65]);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMediaLoader, setShowMediaLoader] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'website' | 'image' | 'video'>('website');
  const [headTracking, setHeadTracking] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState({ x: 0, y: 0, z: 0 });
  const leftEyeRef = useRef<HTMLIFrameElement>(null);
  const rightEyeRef = useRef<HTMLIFrameElement>(null);
  const singleViewRef = useRef<HTMLIFrameElement>(null);

  const loadUrl = () => {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Add to history
    if ((window as any).addToVRHistory) {
      (window as any).addToVRHistory(targetUrl);
    }

    setContentType('website');
    setMediaFile(null);
  };

  const handleMediaLoad = (file: File, type: 'image' | 'video') => {
    setMediaFile(file);
    setContentType(type);
    setUrl(file.name);
  };

  const handleUrlLoad = (newUrl: string) => {
    setUrl(newUrl);
    setContentType('website');
    setMediaFile(null);
    setTimeout(() => loadUrl(), 100);
  };

  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
    setTimeout(() => loadUrl(), 100);
  };

  const refresh = () => {
    loadUrl();
  };

  const goHome = () => {
    setUrl('https://example.com');
    setContentType('website');
    setMediaFile(null);
    setTimeout(() => loadUrl(), 100);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      try {
        (screen.orientation as any)?.lock?.('landscape');
      } catch (error) {
        console.log('Screen orientation lock not supported');
      }
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const handleNavigateFromHistory = (newUrl: string) => {
    handleUrlLoad(newUrl);
  };

  // Device orientation for head tracking
  useEffect(() => {
    if (!headTracking) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setDeviceOrientation({
        x: event.beta || 0,   // front-to-back tilt
        y: event.gamma || 0,  // left-to-right tilt
        z: event.alpha || 0   // compass direction
      });
    };

    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          console.log('Device orientation permission denied');
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [headTracking]);

  useEffect(() => {
    loadUrl();
  }, []);

  // Gaze selection simulation
  const [gazeTarget, setGazeTarget] = useState<string | null>(null);
  const [gazeTimer, setGazeTimer] = useState<NodeJS.Timeout | null>(null);

  const handleGazeStart = (targetId: string, action: () => void) => {
    setGazeTarget(targetId);
    const timer = setTimeout(() => {
      action();
      setGazeTarget(null);
    }, 2000);
    setGazeTimer(timer);
  };

  const handleGazeEnd = () => {
    if (gazeTimer) {
      clearTimeout(gazeTimer);
      setGazeTimer(null);
    }
    setGazeTarget(null);
  };

  return (
    <div className="min-h-screen bg-background vr-grid relative overflow-hidden">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <Card className="vr-panel p-4">
          <div className="flex items-center space-x-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadUrl()}
              placeholder="Enter website URL..."
              className="flex-1 bg-input border-border text-foreground"
            />
            <Button 
              onClick={loadUrl}
              className="btn-vr"
              size="sm"
            >
              Go
            </Button>
            <Button
              onClick={toggleVRMode}
              variant={isVRMode ? "default" : "outline"}
              className={isVRMode ? "btn-vr" : ""}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isVRMode ? 'Normal' : 'VR Mode'}
            </Button>
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              size="sm"
              className="vr-glow"
            >
              <History className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="sm"
              className="vr-glow"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => setShowMediaLoader(true)}
              variant="outline"
              size="sm"
              className="vr-glow"
              title="Load Media Files"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowSuggestions(true)}
              variant="outline"
              size="sm"
              className="vr-glow"
              title="VR-Friendly Sites"
            >
              <Globe className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Floating VR Controls */}
      {showControls && (
        <div className="absolute top-24 right-4 z-50">
          <Card className="vr-panel p-4 w-64">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">VR Controls</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowControls(false)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation Controls */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="vr-glow"
                  onMouseEnter={() => handleGazeStart('back', () => history.back())}
                  onMouseLeave={handleGazeEnd}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="vr-glow"
                  onMouseEnter={() => handleGazeStart('forward', () => history.forward())}
                  onMouseLeave={handleGazeEnd}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="vr-glow"
                  onMouseEnter={() => handleGazeStart('refresh', refresh)}
                  onMouseLeave={handleGazeEnd}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="vr-glow"
                  onMouseEnter={() => handleGazeStart('home', goHome)}
                  onMouseLeave={handleGazeEnd}
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Control */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Zoom: {zoom[0]}%</label>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  max={200}
                  min={50}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Distance Control */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Distance: {distance[0]}%</label>
                <Slider
                  value={distance}
                  onValueChange={setDistance}
                  max={100}
                  min={25}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* IPD Control */}
              {isVRMode && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">IPD: {ipd[0]}mm</label>
                  <Slider
                    value={ipd}
                    onValueChange={setIpd}
                    max={75}
                    min={55}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Head Tracking Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Head Tracking</label>
                <Button
                  onClick={() => setHeadTracking(!headTracking)}
                  variant={headTracking ? "default" : "outline"}
                  size="sm"
                  className={headTracking ? "btn-vr" : ""}
                >
                  {headTracking ? 'ON' : 'OFF'}
                </Button>
              </div>

              {/* Media Controls */}
              {contentType !== 'website' && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Media: {mediaFile?.name || 'None'}
                  </label>
                  <Button
                    onClick={() => setShowMediaLoader(true)}
                    variant="outline"
                    className="w-full vr-glow"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Media
                  </Button>
                </div>
              )}

              {/* Fullscreen Toggle */}
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                className="w-full vr-glow"
                size="sm"
              >
                <Maximize className="w-4 h-4 mr-2" />
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Controls Toggle Button */}
      {!showControls && (
        <Button
          onClick={() => setShowControls(true)}
          className="absolute top-24 right-4 z-50 btn-vr"
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
      )}

      {/* Main VR Scene */}
      <div className="absolute inset-0 pt-20">
        <VRScene3D
          content={url}
          contentType={contentType}
          isVRMode={isVRMode}
          zoom={zoom[0]}
          distance={distance[0]}
          ipd={ipd[0]}
          mediaFile={mediaFile}
        />
      </div>

      {/* Gaze Selection Indicator */}
      {gazeTarget && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="vr-pulse">
            <div className="w-32 h-32 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-primary bg-primary/40 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browser History Modal */}
      <BrowserHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onNavigate={handleNavigateFromHistory}
      />

      {/* Media Loader Modal */}
      <MediaLoader
        isOpen={showMediaLoader}
        onClose={() => setShowMediaLoader(false)}
        onLoadMedia={handleMediaLoad}
        onLoadUrl={handleUrlLoad}
      />
      
      {/* URL Suggestions Modal */}
      <URLSuggestions
        isVisible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onSelectUrl={handleNavigateFromHistory}
      />
    </div>
  );
};

export default VRBrowser;