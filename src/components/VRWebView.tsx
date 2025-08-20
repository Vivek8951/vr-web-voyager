import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Plane, Text, Html } from '@react-three/drei';
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
      const eyeOffset = (ipd - 65) * 0.001; // Convert mm to meters
      const offset = eye === 'left' ? -eyeOffset : eyeOffset;
      camera.position.x = offset;
      
      // Apply head tracking if enabled
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

// Website Display Component
function WebsiteDisplay({ 
  url, 
  zoom, 
  distance, 
  isLoading 
}: {
  url: string;
  zoom: number;
  distance: number;
  isLoading: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Create website texture from iframe
  useEffect(() => {
    if (!url || isLoading) return;

    // Create a canvas to render the website
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f172a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add VR grid pattern
      ctx.strokeStyle = '#00ffff20';
      ctx.lineWidth = 2;
      
      const gridSize = 100;
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
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VR Web Browser', canvas.width / 2, 200);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.fillText(`Loading: ${url}`, canvas.width / 2, 300);
      
      // Add browser frame
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(100, 400, canvas.width - 200, 500);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText('Website content will appear here', canvas.width / 2, 650);
      ctx.fillText('VR Mode provides immersive browsing experience', canvas.width / 2, 700);
      
      // Add floating VR elements
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 15 + 5;
        
        ctx.fillStyle = `hsl(${195 + Math.random() * 85}, 100%, ${50 + Math.random() * 30}%)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      setTexture(tex);
    }
  }, [url, isLoading]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -distance / 10]}>
      {/* Main display sphere */}
      <Sphere 
        ref={meshRef}
        args={[8 * (zoom / 100), 64, 64]} 
        scale={[-1, 1, 1]} // Invert for correct viewing from inside
      >
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          opacity={0.95}
        />
      </Sphere>
      
      {/* Loading indicator */}
      {isLoading && (
        <Text
          position={[0, 0, -distance / 10 + 1]}
          fontSize={2}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
        >
          Loading...
        </Text>
      )}
    </group>
  );
}

// Media Player Component for VR
function VRMediaPlayer({ 
  mediaFile, 
  contentType, 
  zoom, 
  distance,
  videoRef 
}: { 
  mediaFile: File;
  contentType: 'image' | 'video';
  zoom: number;
  distance: number;
  videoRef?: React.RefObject<HTMLVideoElement>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!mediaFile) return;

    const url = URL.createObjectURL(mediaFile);
    
    if (contentType === 'image') {
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        setTexture(tex);
      });
    } else if (contentType === 'video' && videoRef?.current) {
      const videoTexture = new THREE.VideoTexture(videoRef.current);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      setTexture(videoTexture);
    }
    
    return () => URL.revokeObjectURL(url);
  }, [mediaFile, contentType]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
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
      <Sphere args={[200, 32, 32]} scale={[-1, 1, 1]}>
        <meshBasicMaterial 
          color="#000022"
          transparent={true}
          opacity={0.8}
        />
      </Sphere>
      
      {/* Floating particles */}
      {Array.from({ length: 200 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial 
            color={`hsl(${195 + Math.random() * 85}, 100%, 70%)`}
            opacity={0.8} 
            transparent 
          />
        </mesh>
      ))}
      
      {/* Grid floor */}
      <Plane 
        args={[200, 200]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -20, 0]}
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

  return (
    <div className="w-full h-full">
      {/* Hidden video element for video textures - outside Canvas */}
      {contentType === 'video' && mediaFile && (
        <video
          ref={videoRef}
          crossOrigin="anonymous"
          loop
          muted
          playsInline
          autoPlay
          style={{ display: 'none' }}
          src={URL.createObjectURL(mediaFile)}
        />
      )}

      {isVRMode ? (
        // Stereoscopic VR Mode - Perfect for Google Cardboard
        <div className="flex w-full h-full bg-black">
          {/* Left Eye */}
          <div className="w-1/2 h-full border-r border-gray-500" style={{ borderWidth: '1px' }}>
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
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              
              <VREnvironment />
              
              {mediaFile ? (
                <VRMediaPlayer 
                  mediaFile={mediaFile}
                  contentType={contentType as 'image' | 'video'}
                  zoom={zoom}
                  distance={distance}
                  videoRef={videoRef}
                />
              ) : (
                <WebsiteDisplay 
                  url={url}
                  zoom={zoom}
                  distance={distance}
                  isLoading={isLoading}
                />
              )}
            </Canvas>
          </div>
          
          {/* Right Eye */}
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
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              
              <VREnvironment />
              
              {mediaFile ? (
                <VRMediaPlayer 
                  mediaFile={mediaFile}
                  contentType={contentType as 'image' | 'video'}
                  zoom={zoom}
                  distance={distance}
                  videoRef={videoRef}
                />
              ) : (
                <WebsiteDisplay 
                  url={url}
                  zoom={zoom}
                  distance={distance}
                  isLoading={isLoading}
                />
              )}
            </Canvas>
          </div>
        </div>
      ) : (
        // Normal Single View Mode
        <Canvas
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ alpha: false, antialias: true }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          
          <VREnvironment />
          
          {mediaFile ? (
            <VRMediaPlayer 
              mediaFile={mediaFile}
              contentType={contentType as 'image' | 'video'}
              zoom={zoom}
              distance={distance}
              videoRef={videoRef}
            />
          ) : (
            <WebsiteDisplay 
              url={url}
              zoom={zoom}
              distance={distance}
              isLoading={isLoading}
            />
          )}
        </Canvas>
      )}
    </div>
  );
};