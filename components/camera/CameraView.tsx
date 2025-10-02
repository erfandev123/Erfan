/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useUI } from '../../lib/state';
import './CameraView.css';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';

const CameraView: React.FC = () => {
  const { setCameraOpen } = useUI();
  const { client } = useLiveAPIContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setError('Camera access is not supported by this browser.');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(
          'Could not access the camera. Please ensure you have given permission.',
        );
      }
    };

    startCamera();

    return () => {
      cleanupCamera();
    };
  }, [cleanupCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = dataUrl.split(',')[1];

        client.sendRealtimeInput([
          {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        ]);
        setCameraOpen(false);
      }
    }
  };

  const handleClose = () => {
    setCameraOpen(false);
  };

  return (
    <div className="camera-view-overlay">
      <video
        ref={videoRef}
        className="camera-feed"
        autoPlay
        playsInline
        muted
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {error && <div className="camera-error">{error}</div>}
      <div className="camera-controls">
        <button
          className="camera-close-button"
          onClick={handleClose}
          aria-label="Close camera"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <button
          className="camera-capture-button"
          onClick={handleCapture}
          aria-label="Capture and send image"
        >
          <span className="material-symbols-outlined">camera</span>
          <span>Capture & Send</span>
        </button>
      </div>
    </div>
  );
};

export default CameraView;