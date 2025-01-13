import React, { useRef, useEffect, useState } from 'react';
import { vertexShader, fragmentShader } from '../shaders/shaders';
import { Canvas } from '@react-three/fiber';
import '../App.css';

// Linear Interpolation Function for Smooth Transitions
const lerp = (a, b, t) => a + (b - a) * t;

const Icosahedron = ({ audioData, avgFreq }) => {
  const meshRef = useRef();

  // Initialize shader uniforms
  const [uniforms] = useState({
    u_time: { type: 'f', value: 0.0 }, // Initial time value
    u_frequency: { type: 'f', value: 0.0 }, // Initial frequency value
  });

  const [scaleFactor, setScaleFactor] = useState(1); // Initialize scale factor
  const targetScaleFactor = useRef(1); // Target scale for smooth interpolation

  useEffect(() => {
    if (audioData && audioData.length > 0) {
      const maxAudioValue = Math.max(...audioData); // Get the max value from audioData

      if (maxAudioValue > 175) {
        const normalizedValue = maxAudioValue / 255; // Normalize to [0, 1]
        const smoothFactor = normalizedValue; // Scale dynamically

        // Update the target scale factor for smooth transition
        targetScaleFactor.current = smoothFactor + 0.5;

        // Update the shader uniform for real-time response
        if (meshRef.current && meshRef.current.material) {
          const currentFrequency = meshRef.current.material.uniforms.u_frequency.value;
          meshRef.current.material.uniforms.u_frequency.value = lerp(
            currentFrequency,
            smoothFactor * 2,
            0.1 // Adjust lerp factor for smoother transitions
          );
        }
      } else {
        // If maxAudioValue <= 175, set a lower limit for the scale and frequency
        targetScaleFactor.current = 1; // Default low scale
        if (meshRef.current && meshRef.current.material) {
          const currentFrequency = meshRef.current.material.uniforms.u_frequency.value;
          meshRef.current.material.uniforms.u_frequency.value = lerp(currentFrequency, 0.5, 0.1); // Smooth transition to default frequency
        }
      }
    }
  }, [audioData]); // Recalculate on audioData change

  useEffect(() => {
    // Update u_time continuously for animation
    const updateTime = () => {
      if (meshRef.current && meshRef.current.material) {
        meshRef.current.material.uniforms.u_time.value += 0.005 * scaleFactor; // Increment time value
      }

      // Smoothly update the scale factor
      setScaleFactor((prev) => lerp(prev, targetScaleFactor.current, 0.4)); // Adjust lerp factor for smooth scaling
    };

    // Set interval to update u_time
    const interval = setInterval(updateTime, 16); // 16ms ~60fps
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <Canvas id="canvas" camera={{ position: [0, 0, 15], fov: 75 }}>
      {/* {console.log(avgFreq)} */}
      <mesh ref={meshRef} scale={scaleFactor}>
        <directionalLight intensity={1.5} position={[10, 10, 10]} />
        <ambientLight intensity={0.5} />
        <icosahedronGeometry args={[5, 40]} />
        <shaderMaterial
          wireframe={true}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms} // Pass uniforms, including u_time and u_frequency
        />
      </mesh>
    </Canvas>
  );
};

export default Icosahedron;
