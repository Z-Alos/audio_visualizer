import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const CanvasComponent = ({ audioData }) => {
  // Calculate scaleFactor based on audioData
  const scaleFactor = audioData
    ? Math.max(...audioData) > 115
      ? Math.max(...audioData) / 255
      : 0.5
    : 0.5;

  return (
    <div style={{ width: "90vw", height: "60vh" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[1, 1, 1]} />
        <mesh scale={[scaleFactor, scaleFactor, scaleFactor]}>
          <sphereGeometry args={[2, 21, 21]} />
          <meshStandardMaterial wireframe={true} color={"skyblue"} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default CanvasComponent;
