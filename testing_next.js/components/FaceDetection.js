// components/FaceDetection.js
import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const FaceApiDynamic = dynamic(() => import('face-api.js'), {
  ssr: false
});

const FaceDetection = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await FaceApiDynamic; // Menunggu dynamic import face-api.js
      await faceapi.nets.tinyFaceDetector.loadFromUri('/tiny_face_detector_model-weights_manifest.json');
    };

    const startVideo = async () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: {} })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((error) => console.error('Error accessing webcam:', error));
      }
    };

    const detectFace = async () => {
      const canvas = faceapi.createCanvasFromMedia(videoRef.current);
      document.body.append(canvas);

      const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
      faceapi.matchDimensions(canvas, displaySize);

      const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceDescriptors(canvas, resizedDetections);

      requestAnimationFrame(detectFace);
    };

    loadModels();
    startVideo();
    detectFace();
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto' }}></video>
    </div>
  );
};

export default FaceDetection;
