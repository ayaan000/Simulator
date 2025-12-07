"use client";
import React, { useState } from 'react';
import SimulationLayout from '@/components/SimulationLayout';
import AlgorithmsView from '@/components/views/AlgorithmsView';
import GraphView from '@/components/views/GraphView';
import MazeView from '@/components/views/MazeView';
import FlowView from '@/components/views/FlowView';
import FluidView from '@/components/views/FluidView';
import TerraformingView from '@/components/views/TerraformingView';
import UniverseView from '@/components/views/UniverseView';
import AutomataView from '@/components/views/AutomataView';
import PhysicsView from '@/components/views/PhysicsView';

export default function Home() {
  const [activeSim, setActiveSim] = useState<any>('sorting');

  const renderContent = () => {
    switch (activeSim) {
      case 'sorting': return <AlgorithmsView />;
      case 'graph': return <GraphView />;
      case 'maze': return <MazeView />;
      case 'flow': return <FlowView />;
      case 'fluid': return <FluidView />;
      case 'terraforming': return <TerraformingView />;
      case 'automata': return <AutomataView />;
      case 'physics': return <PhysicsView />;
      case 'universe': return <UniverseView />;
      default: return <div>Select a simulation</div>;
    }
  };

  return (
    <SimulationLayout activeSim={activeSim} setActiveSim={setActiveSim}>
      {renderContent()}
    </SimulationLayout>
  );
}
