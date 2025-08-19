import React from 'react';
import VRBrowser from '@/components/VRBrowser';
import { VRBackground } from '@/components/VRBackground';

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <VRBackground />
      <VRBrowser />
    </div>
  );
};

export default Index;
