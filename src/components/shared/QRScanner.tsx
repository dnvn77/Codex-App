
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, VideoOff } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: string | null) => void;
  t: any;
}

export function QRScanner({ onScan, t }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const animationFrameId = useRef<number>();

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code) {
                onScan(code.data);
                // No return here, allow the cleanup function to handle stopping the stream
            } else {
                animationFrameId.current = requestAnimationFrame(tick);
            }
        }
      }
    } else {
        animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Use onloadedmetadata to ensure video dimensions are available before playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            animationFrameId.current = requestAnimationFrame(tick);
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t.cameraPermissionTitle,
          description: t.cameraPermissionDesc,
        });
      }
    };

    startScan();

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
      {hasCameraPermission === null && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>{t.loadingCamera}</p>
        </div>
      )}
      
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="w-auto">
          <VideoOff className="h-4 w-4" />
          <AlertTitle>{t.cameraPermissionTitle}</AlertTitle>
          <AlertDescription>{t.cameraPermissionDesc}</AlertDescription>
        </Alert>
      )}

      {hasCameraPermission === true && (
        <>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-8 border-primary/50 rounded-lg" style={{
                clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)'
            }}/>
            <p className="absolute bottom-4 text-white bg-black/50 px-3 py-1 rounded-md">{t.scanning}</p>
        </>
      )}
    </div>
  );
}
