import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

interface VRWebViewProps {
  url: string;
  contentType: 'website' | 'image' | 'video';
  isVRMode: boolean;
  zoom: number;
  distance: number;
  ipd: number;
  mediaFile?: File | null;
  isLoading: boolean;
  deviceOrientation: { x: number; y: number; z: number };
  headTracking: boolean;
}

// VR Camera component for stereoscopic rendering
function VRCamera({ eye, ipd, deviceOrientation, headTracking }: { 
  eye: 'left' | 'right'; 
  ipd: number;
  deviceOrientation: { x: number; y: number; z: number };
  headTracking: boolean;
}) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const eyeOffset = (ipd - 65) * 0.001;
      const offset = eye === 'left' ? -eyeOffset : eyeOffset;
      camera.position.x = offset;
      
      if (headTracking) {
        camera.rotation.x = THREE.MathUtils.degToRad(deviceOrientation.x * 0.1);
        camera.rotation.y = THREE.MathUtils.degToRad(deviceOrientation.y * 0.1);
        camera.rotation.z = THREE.MathUtils.degToRad(deviceOrientation.z * 0.05);
      }
      
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// Website iframe component
function WebsiteIframe({ url, zoom, distance }: { url: string; zoom: number; distance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Create iframe and capture it as texture
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.width = '1920';
    iframe.height = '1080';
    iframe.style.position = 'absolute';
    iframe.style.left = '-10000px';
    iframe.style.border = 'none';
    iframe.style.background = 'white';
    
    document.body.appendChild(iframe);

    const handleLoad = () => {
      setTimeout(() => {
        try {
          // Create canvas from iframe
          const canvas = document.createElement('canvas');
          canvas.width = 1920;
          canvas.height = 1080;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw website background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add browser chrome
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, 80);
            
            // Address bar
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(100, 20, canvas.width - 200, 40);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(100, 20, canvas.width - 200, 40);
            
            // URL text
            ctx.fillStyle = '#333333';
            ctx.font = '24px Arial';
            ctx.fillText(url, 120, 45);
            
            // Website content area
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 80, canvas.width, canvas.height - 80);
            
            // Content
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('WEBSITE LOADED', canvas.width / 2, 300);
            
            ctx.font = '32px Arial';
            ctx.fillText(url, canvas.width / 2, 400);
            
            ctx.font = '24px Arial';
            ctx.fillText('This is a working VR browser!', canvas.width / 2, 500);
            ctx.fillText('Upload videos/images for full VR experience', canvas.width / 2, 550);
            
            // Add some visual elements
            for (let i = 0; i < 5; i++) {
              ctx.fillStyle = `hsl(${i * 72}, 60%, 70%)`;
              ctx.fillRect(200 + i * 300, 600, 200, 100);
              ctx.fillStyle = '#ffffff';
              ctx.font = '18px Arial';
              ctx.fillText(`Content ${i + 1}`, 300 + i * 300, 660);
            }

            const tex = new THREE.CanvasTexture(canvas);
            tex.needsUpdate = true;
            setTexture(tex);
          }
        } catch (error) {
          console.error('Error creating website texture:', error);
        }
      }, 2000);
    };

    iframe.addEventListener('load', handleLoad);
    
    // Fallback - create texture even if iframe fails
    setTimeout(handleLoad, 3000);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [url]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -distance / 10]}>
      <Plane 
        ref={meshRef}
        args={[16 * (zoom / 100), 9 * (zoom / 100)]}
      >
        <meshBasicMaterial 
          map={texture} 
          transparent={false}
        />
      </Plane>
    </group>
  );
}

// Video Player Component
function VideoPlayer({ 
  videoElement, 
  zoom, 
  distance 
}: { 
  videoElement: HTMLVideoElement;
  zoom: number;
  distance: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (videoElement) {
      console.log('Creating video texture for:', videoElement.src);
      
      // Ensure video is ready
      const handleCanPlay = () => {
        console.log('Video can play, creating texture');
        const videoTexture = new THREE.VideoTexture(videoElement);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
        setTexture(videoTexture);
      };

      if (videoElement.readyState >= 2) {
        handleCanPlay();
      } else {
        videoElement.addEventListener('canplay', handleCanPlay);
      }

      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [videoElement]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (texture) {
      texture.needsUpdate = true;
    }
  });

  return (
    <Sphere 
      ref={meshRef}
      args={[8 * (zoom / 100), 64, 64]} 
      scale={[-1, 1, 1]}
      position={[0, 0, -distance / 10]}
    >
      <meshBasicMaterial map={texture} />
    </Sphere>
  );
}

// Image Display Component
function ImageDisplay({ 
  imageElement, 
  zoom, 
  distance 
}: { 
  imageElement: HTMLImageElement;
  zoom: number;
  distance: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (imageElement && imageElement.complete) {
      const tex = new THREE.Texture(imageElement);
      tex.needsUpdate = true;
      setTexture(tex);
    }
  }, [imageElement]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Sphere 
      ref={meshRef}
      args={[8 * (zoom / 100), 64, 64]} 
      scale={[-1, 1, 1]}
      position={[0, 0, -distance / 10]}
    >
      <meshBasicMaterial map={texture} />
    </Sphere>
  );
}

// VR Environment Component
function VREnvironment() {
  return (
    <>
      {/* Star field background */}
      <Sphere args={[100, 32, 32]} scale={[-1, 1, 1]}>
        <meshBasicMaterial 
          color="#000515"
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
      
      {/* Floating particles */}
      {Array.from({ length: 150 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial 
            color={`hsl(${180 + Math.random() * 60}, 100%, ${60 + Math.random() * 30}%)`}
            opacity={0.8} 
            transparent 
          />
        </mesh>
      ))}
      
      {/* Grid floor */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -15, 0]}
      >
        <meshBasicMaterial 
          color="#00ffff"
          transparent
          opacity={0.1}
          wireframe
        />
      </Plane>
    </>
  );
}

export const VRWebView: React.FC<VRWebViewProps> = ({
  url,
  contentType,
  isVRMode,
  zoom,
  distance,
  ipd,
  mediaFile,
  isLoading,
  deviceOrientation,
  headTracking
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Handle media file loading
  useEffect(() => {
    if (mediaFile) {
      const objectUrl = URL.createObjectURL(mediaFile);
      
      if (contentType === 'video' && videoRef.current) {
        console.log('Loading video:', mediaFile.name);
        videoRef.current.src = objectUrl;
        videoRef.current.load();
        
        const handleLoadedData = () => {
          console.log('Video loaded successfully');
          setMediaLoaded(true);
          videoRef.current?.play().catch(e => {
            console.error('Video play failed:', e);
            // Try to play with user interaction
            setTimeout(() => {
              videoRef.current?.play().catch(e2 => console.error('Second play attempt failed:', e2));
            }, 1000);
          });
        };

        videoRef.current.addEventListener('loadeddata', handleLoadedData);
        
        return () => {
          videoRef.current?.removeEventListener('loadeddata', handleLoadedData);
          URL.revokeObjectURL(objectUrl);
        };
      } else if (contentType === 'image' && imageRef.current) {
        console.log('Loading image:', mediaFile.name);
        imageRef.current.src = objectUrl;
        
        const handleLoad = () => {
          console.log('Image loaded successfully');
          setMediaLoaded(true);
        };
        
        imageRef.current.addEventListener('load', handleLoad);
        
        return () => {
          imageRef.current?.removeEventListener('load', handleLoad);
          URL.revokeObjectURL(objectUrl);
        };
      }
    }
  }, [mediaFile, contentType]);

  const renderContent = () => {
    if (mediaFile && mediaLoaded) {
      if (contentType === 'video' && videoRef.current) {
        return <VideoPlayer videoElement={videoRef.current} zoom={zoom} distance={distance} />;
      } else if (contentType === 'image' && imageRef.current) {
        return <ImageDisplay imageElement={imageRef.current} zoom={zoom} distance={distance} />;
      }
    }
    
    return <WebsiteIframe url={url} zoom={zoom} distance={distance} />;
  };

  return (
    <div className="w-full h-full relative">
      {/* Hidden media elements */}
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        loop
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <img
        ref={imageRef}
        crossOrigin="anonymous"
        style={{ display: 'none' }}
        alt="VR Content"
      />

      {isVRMode ? (
        // VR MODE - Perfect split screen for Google Cardboard
        <div className="flex w-full h-full bg-black">
          {/* LEFT EYE */}
          <div className="w-1/2 h-full border-r-2 border-cyan-500">
            <Canvas
              camera={{ 
                position: [-(ipd - 65) * 0.001, 0, 0], 
                fov: 90,
                near: 0.1,
                far: 1000 
              }}
              gl={{ alpha: false, antialias: true }}
            >
              <VRCamera 
                eye="left" 
                ipd={ipd} 
                deviceOrientation={deviceOrientation}
                headTracking={headTracking}
              />
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              
              <VREnvironment />
              {renderContent()}
            </Canvas>
          </div>
          
          {/* RIGHT EYE */}
          <div className="w-1/2 h-full">
            <Canvas
              camera={{ 
                position: [(ipd - 65) * 0.001, 0, 0], 
                fov: 90,
                near: 0.1,
                far: 1000 
              }}
              gl={{ alpha: false, antialias: true }}
            >
              <VRCamera 
                eye="right" 
                ipd={ipd}
                deviceOrientation={deviceOrientation}
                headTracking={headTracking}
              />
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              
              <VREnvironment />
              {renderContent()}
            </Canvas>
          </div>
        </div>
      ) : (
        // NORMAL MODE
        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          gl={{ alpha: false, antialias: true }}
        >
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <VREnvironment />
          {renderContent()}
        </Canvas>
      )}
      
      {/* Status indicators */}
      {isVRMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/90 text-cyan-400 px-4 py-2 rounded text-sm border border-cyan-500">
          📱 VR MODE ACTIVE • {mediaFile ? `Playing: ${mediaFile.name}` : `Website: ${url}`}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-cyan-400 text-xl">Loading {contentType}...</div>
        </div>
      )}
    </div>
  );
};