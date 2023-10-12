// pages/index.tsx (atau pages/index.js jika tidak menggunakan TypeScript)

import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const Home = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      ]);
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia(
        { video: {} },
        (stream) => (videoRef.current.srcObject = stream),
        (err) => console.error(err)
      );
    };

    const setupFaceApi = async () => {
      await loadModels();
      startVideo();

      videoRef.current.addEventListener('playing', () => {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        document.body.append(canvas);
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvas, displaySize);
        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
      });
    };

    setupFaceApi();
  }, []);

  return <video ref={videoRef} width="720" height="560" autoPlay muted />;
};

export default Home;
