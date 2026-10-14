import {
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  type FaceLandmarkerResult,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';

export type VisionStatus = 'idle' | 'loading' | 'running' | 'denied' | 'error';

export interface VisionFrame {
  hand?: HandLandmarkerResult;
  face?: FaceLandmarkerResult;
}

interface Options {
  withFace?: boolean;
  onFrame: (frame: VisionFrame) => void;
}

// Assets are served locally from /public (see scripts/setup-vision.mjs).
const WASM_PATH = '/wasm';
const HAND_MODEL = '/models/hand_landmarker.task';
const FACE_MODEL = '/models/face_landmarker.task';

/**
 * Owns the webcam stream and the MediaPipe landmarkers. Everything runs
 * on-device; the frame data never leaves the browser. `start`/`stop` are
 * exposed so the camera is only on when a child is actually playing.
 */
export function useVision({ withFace = false, onFrame }: Options) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<VisionStatus>('idle');

  const handRef = useRef<HandLandmarker | null>(null);
  const faceRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTime = useRef(-1);
  const onFrameRef = useRef(onFrame);
  const withFaceRef = useRef(withFace);
  useEffect(() => {
    onFrameRef.current = onFrame;
    withFaceRef.current = withFace;
  }, [onFrame, withFace]);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  // Stable loop stored in a ref so it can recurse without capturing itself
  // during initialization and without writing refs during render.
  const loopRef = useRef<() => void>(() => {});
  useEffect(() => {
    loopRef.current = () => {
      const video = videoRef.current;
      const hand = handRef.current;
      if (video && hand && video.readyState >= 2 && video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        const now = performance.now();
        const frame: VisionFrame = { hand: hand.detectForVideo(video, now) };
        if (withFaceRef.current && faceRef.current) frame.face = faceRef.current.detectForVideo(video, now);
        onFrameRef.current(frame);
      }
      rafRef.current = requestAnimationFrame(() => loopRef.current());
    };
  }, []);

  const start = useCallback(async () => {
    if (status === 'loading' || status === 'running') return;
    setStatus('loading');
    try {
      if (!handRef.current) {
        const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
        handRef.current = await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        if (withFaceRef.current) {
          faceRef.current = await FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFaceBlendshapes: false,
          });
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('No video element');
      video.srcObject = stream;
      await video.play();
      setStatus('running');
      lastVideoTime.current = -1;
      rafRef.current = requestAnimationFrame(() => loopRef.current());
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'NotFoundError');
      setStatus(denied ? 'denied' : 'error');
      console.warn('[vision] start failed:', err);
    }
  }, [status]);

  useEffect(() => stop, [stop]);

  return { videoRef, status, start, stop };
}
