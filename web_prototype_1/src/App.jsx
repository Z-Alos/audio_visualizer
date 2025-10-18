import React, { useState } from 'react';
import Icosahedron from './components/Icosahedron';
import './App.css';

const App = () => {
  const [audioData, setAudioData] = useState([]);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [avgFrequency, setAvgFrequency] = useState(0); // State for average frequency

  const startAudio = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    // Create a low-pass filter
    const lowPassFilter = audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass'; // Set the filter type to low-pass
    lowPassFilter.frequency.setValueAtTime(500, audioContext.currentTime); // Set cutoff frequency to 500 Hz
    lowPassFilter.Q.setValueAtTime(1, audioContext.currentTime); // Adjust Q for filter sharpness
  
    // Get user microphone input
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(lowPassFilter); // Connect the source to the filter
        lowPassFilter.connect(analyser); // Connect the filter to the analyser
  
        // Update audio data
        const updateAudioData = () => {
          analyser.getByteFrequencyData(dataArray);
          setAudioData([...dataArray]);
  
          // Calculate average frequency
          const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAvgFrequency(avgFreq); // Update state with average frequency
  
          requestAnimationFrame(updateAudioData);
        };
        updateAudioData();
        setIsAudioStarted(true); // Mark audio as started
      })
      .catch((err) => console.error('Audio input failed:', err));
  };
  

  return (
    <div id="canvas-wrapper">
      {!isAudioStarted ? (
        <button onClick={startAudio}>Start Audio</button>
      ) : (
        <Icosahedron audioData={audioData} avgFreq={avgFrequency} />
      )}
      <pre className='text'>{JSON.stringify(audioData, null, 2)}</pre>
    </div>
  );
};

export default App;
