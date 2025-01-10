import React, { useEffect, useState } from 'react';
import CanvasComponent from './CanvasComponent';

function App() {
  const [audioData, setAudioData] = useState([]);
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const startAudio = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Create a high-pass filter to remove low-frequency noise
    const highPassFilter = audioContext.createBiquadFilter();
    highPassFilter.type = "highpass"; // Filter type
    highPassFilter.frequency.value = 10; // Removes frequencies below 100 Hz

    // Get user microphone input
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);

        // Connect source -> high-pass filter -> analyser
        source.connect(highPassFilter);
        highPassFilter.connect(analyser);

        // Update audio data
        const updateAudioData = () => {
          analyser.getByteFrequencyData(dataArray);
          setAudioData([...dataArray]);
          requestAnimationFrame(updateAudioData);
        };
        updateAudioData();
        setIsAudioStarted(true); // Mark audio as started
      })
      .catch((err) => console.error('Audio input failed:', err));
  };

  return (
    <div className="App">
      <h1>Audio Reactive Visualization</h1>
      
      {!isAudioStarted ? (
        <button onClick={startAudio}>Start Audio</button>
      ) : (
        <CanvasComponent audioData={audioData} />
      )}
      <pre>{JSON.stringify(audioData, null, 2)}</pre>
    </div>
  );
}

export default App;
