"use client";

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Loader2, Lock, Camera, StopCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LiveBroadcastProps {
  isAdmin?: boolean;
}

export function LiveBroadcast({ isAdmin = false }: LiveBroadcastProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate connection delay for viewers
    if (!isAdmin) {
      const timer = setTimeout(() => setIsConnecting(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsConnecting(false);
    }
  }, [isAdmin]);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to broadcast to the sanctuary.',
      });
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", isStreaming || !isAdmin ? "bg-destructive/10 animate-pulse" : "bg-muted/20")}>
            <Radio className={cn("h-5 w-5", isStreaming || !isAdmin ? "text-destructive" : "text-muted-foreground")} />
          </div>
          <h2 className="text-sm font-headline font-black uppercase tracking-widest text-foreground">Sanctuary Cam</h2>
        </div>
        <Badge variant="outline" className={cn(
          "text-[8px] font-black uppercase tracking-widest border-destructive/30 text-destructive flex items-center gap-1.5",
          (isStreaming || !isAdmin) ? "opacity-100" : "opacity-40"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full bg-destructive", (isStreaming || !isAdmin) && "animate-ping")} />
          {isStreaming || !isAdmin ? 'LIVE BROADCAST' : 'OFFLINE'}
        </Badge>
      </div>

      <Card className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-border group">
        {isConnecting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/5 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Live Feed...</p>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              className={cn("w-full h-full object-cover", !isStreaming && !isAdmin ? "opacity-60" : "opacity-100")} 
              autoPlay 
              muted 
              playsInline
            />

            {!isStreaming && !isAdmin && (
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/duck-cam/1280/720')] bg-cover bg-center opacity-40 grayscale-[0.2]" />
            )}

            {!isStreaming && isAdmin && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm space-y-4">
                <Camera className="h-12 w-12 text-primary opacity-20" />
                <Button onClick={startStream} className="bg-primary text-primary-foreground font-black h-12 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform">
                  START BROADCAST <Play className="ml-2 h-4 w-4 fill-current" />
                </Button>
              </div>
            )}

            <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
              <Badge className={cn("text-white border-none font-black text-[10px] px-3 py-1", isStreaming || !isAdmin ? "bg-destructive" : "bg-muted")}>
                {isStreaming || !isAdmin ? 'REC' : 'OFF'}
              </Badge>
              <Badge className="bg-black/40 backdrop-blur-md text-white/80 border-none text-[8px] font-bold px-2 py-1">
                {isAdmin ? 'ADMIN_HUB_CONTROL' : 'CAM_01_NORTH_PEN'}
              </Badge>
            </div>

            {isStreaming && isAdmin && (
              <div className="absolute bottom-4 right-4">
                <Button onClick={stopStream} variant="destructive" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                  <StopCircle className="mr-2 h-4 w-4" /> STOP STREAM
                </Button>
              </div>
            )}

            <div className="absolute bottom-4 left-4 pointer-events-none">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Sanctuary Live Pulse</p>
              <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">2026 Season • High Fidelity Transparency</p>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}

export function LiveStreamTeaser() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted/20 rounded-lg">
          <Camera className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-headline font-black uppercase tracking-widest text-muted-foreground">Sanctuary Cam</h2>
      </div>
      
      <Card className="relative aspect-video bg-card border-2 border-dashed border-border rounded-3xl overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/duck-blur/1280/720')] bg-cover bg-center opacity-10 blur-xl scale-110" />
        
        <div className="relative z-10 space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-xl">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight text-foreground">UNLOCK LIVE ACCESS</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
              Sanctuary Cam feeds are exclusive to verified Guardians. <br />Upgrade today to follow the flock in real-time.
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground font-black h-14 px-10 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-transform">
            <a href="/support#membership">UPGRADE TO GUARDIAN <Play className="ml-2 h-3.5 w-3.5 fill-current" /></a>
          </Button>
        </div>
      </Card>
    </section>
  );
}
