import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Plane, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface VRScene3DProps {
  content: string;
  contentType: 'website' | 'image' | 'video';
  isVRMode: boolean;
  zoom: number;
  distance: number;
  ipd: number;
  mediaFile?: File | null;
}

// VR Camera component for stereoscopic rendering
function VRCamera({ eye, ipd }: { eye: 'left' | 'right'; ipd: number }) {
  const { camera, size } = useThree();
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const eyeOffset = (ipd - 65) * 0.001; // Convert mm to meters
      const offset = eye === 'left' ? -eyeOffset : eyeOffset;
      camera.position.x = offset;
      camera.updateProjectionMatrix();
    }
  }, [camera, ipd, eye]);

  return null;
}

// 3D Content Display Component
function ContentSphere({ 
  content, 
  contentType, 
  zoom, 
  distance, 
  mediaFile 
}: {
  content: string;
  contentType: 'website' | 'image' | 'video';
  zoom: number;
  distance: number;
  mediaFile?: File | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>('');

  // Handle local media files
  useEffect(() => {
    if (mediaFile) {
      const url = URL.createObjectURL(mediaFile);
      setMediaUrl(url);
      
      if (mediaFile.type.startsWith('image/')) {
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          setTexture(tex);
        });
      }
      
      return () => URL.revokeObjectURL(url);
    }
  }, [mediaFile]);

  // Create website texture using HTML2Canvas approach (proxy)
  useEffect(() => {
    if (contentType === 'website' && content && !mediaFile) {
      // For now, create a simple text texture for websites
      // In production, you'd use a screenshot service
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Website...', canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(content, canvas.width / 2, canvas.height / 2 + 60);
        
        const tex = new THREE.CanvasTexture(canvas);
        setTexture(tex);
      }
    }
  }, [content, contentType, mediaFile]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -distance / 10]}>
      <Sphere 
        ref={meshRef}
        args={[5 * (zoom / 100), 32, 32]} 
        scale={[-1, 1, 1]} // Invert for correct viewing from inside
      >
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
      
      {/* VR Environment - Star field */}
      <Sphere args={[100, 32, 32]} scale={[-1, 1, 1]}>
        <meshBasicMaterial 
          color="#000011"
          transparent={true}
          opacity={0.3}
        />
      </Sphere>
      
      {/* Floating particles */}
      {Array.from({ length: 100 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
          ]}
        >
          <sphereGeometry args={[0.02]} />
          <meshBasicMaterial color="#00ffff" opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Video Player Component for VR
function VRVideoPlayer({ mediaFile }: { mediaFile: File }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (mediaFile && videoRef.current) {
      const url = URL.createObjectURL(mediaFile);
      videoRef.current.src = url;
      videoRef.current.load();
      
      const texture = new THREE.VideoTexture(videoRef.current);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      setVideoTexture(texture);
      
      return () => URL.revokeObjectURL(url);
    }
  }, [mediaFile]);

  return (
    <>
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        loop
        muted
        playsInline
        style={{ display: 'none' }}
      />
      {videoTexture && (
        <Sphere args={[5, 32, 32]} scale={[-1, 1, 1]}>
          <meshBasicMaterial map={videoTexture} />
        </Sphere>
      )}
    </>
  );
}

export const VRScene3D: React.FC<VRScene3DProps> = ({
  content,
  contentType,
  isVRMode,
  zoom,
  distance,
  ipd,
  mediaFile
}) => {
  return (
    <div className="w-full h-full">
      {isVRMode ? (
        // Stereoscopic VR Mode
        <div className="flex w-full h-full">
          {/* Left Eye */}
          <div className="w-1/2 h-full border-r border-primary/30">
            <Canvas
              camera={{ 
                position: [-(ipd - 65) * 0.001, 0, 0], 
                fov: 75,
                near: 0.1,
                far: 1000 
              }}
              gl={{ alpha: false }}
            >
              <VRCamera eye="left" ipd={ipd} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              {mediaFile && mediaFile.type.startsWith('video/') ? (
                <VRVideoPlayer mediaFile={mediaFile} />
              ) : (
                <ContentSphere 
                  content={content}
                  contentType={contentType}
                  zoom={zoom}
                  distance={distance}
                  mediaFile={mediaFile}
                />
              )}
            </Canvas>
          </div>
          
          {/* Right Eye */}
          <div className="w-1/2 h-full">
            <Canvas
              camera={{ 
                position: [(ipd - 65) * 0.001, 0, 0], 
                fov: 75,
                near: 0.1,
                far: 1000 
              }}
              gl={{ alpha: false }}
            >
              <VRCamera eye="right" ipd={ipd} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              {mediaFile && mediaFile.type.startsWith('video/') ? (
                <VRVideoPlayer mediaFile={mediaFile} />
              ) : (
                <ContentSphere 
                  content={content}
                  contentType={contentType}
                  zoom={zoom}
                  distance={distance}
                  mediaFile={mediaFile}
                />
              )}
            </Canvas>
          </div>
        </div>
      ) : (
        // Normal Single View Mode
        <Canvas
          camera={{ position: [0, 0, 0], fov: 75 }}
          gl={{ alpha: false }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {mediaFile && mediaFile.type.startsWith('video/') ? (
            <VRVideoPlayer mediaFile={mediaFile} />
          ) : (
            <ContentSphere 
              content={content}
              contentType={contentType}
              zoom={zoom}
              distance={distance}
              mediaFile={mediaFile}
            />
          )}
        </Canvas>
      )}
    </div>
  );
};