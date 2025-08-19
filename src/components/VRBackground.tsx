import React, { useEffect, useState } from 'react';

export const VRBackground: React.FC = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta !== null && event.gamma !== null) {
        setRotation({
          x: event.beta, // front-to-back tilt (-180 to 180)
          y: event.gamma  // left-to-right tilt (-90 to 90)
        });
      }
    };

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        } catch (error) {
          console.log('Permission denied for device orientation');
        }
      } else {
        // For non-iOS devices
        window.addEventListener('deviceorientation', handleDeviceOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 vr-grid opacity-30 pointer-events-none"
      style={{
        transform: `rotateX(${rotation.x * 0.1}deg) rotateY(${rotation.y * 0.1}deg)`
      }}
    >
      {/* Floating VR Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};