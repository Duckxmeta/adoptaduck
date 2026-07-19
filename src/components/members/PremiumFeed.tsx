"use client";

import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase/init';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from '@/firebase';
import { Sparkles, Clock, ShieldAlert, ArrowRight, EyeOff, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface SubscriberPost {
  id: string;
  timestamp: string;
  content_text: string;
  media_urls: string[];
  source_platform: string;
}

export function PremiumFeed() {
  const { user, isUserLoading, isGuardian, isAdmin } = useUser();
  const [posts, setPosts] = useState<SubscriberPost[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAccess = isGuardian || isAdmin;

  useEffect(() => {
    if (!user || !hasAccess) {
      setLoading(false);
      return;
    }

    const { firestore } = initializeFirebase();
    const postsRef = collection(firestore, 'subscriber_posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnap) => {
      const docs: SubscriberPost[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        docs.push({
          id: docSnap.id,
          timestamp: data.timestamp || '',
          content_text: data.content_text || '',
          media_urls: Array.isArray(data.media_urls) ? data.media_urls : [],
          source_platform: data.source_platform || 'X'
        });
      });
      setPosts(docs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching subscriber posts:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, hasAccess]);

  if (isUserLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse font-black">
        Syncing Subscriber Channel...
      </div>
    );
  }

  // 1. Guard Gate for Free Tier
  if (!hasAccess) {
    return (
      <Card className="bg-secondary/5 border-2 border-secondary/20 rounded-[2rem] p-8 text-center space-y-6 max-w-2xl mx-auto shadow-xl animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
          <EyeOff className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <Badge variant="outline" className="border-secondary/40 text-secondary px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-center mx-auto block w-max">
            Exclusive Channel
          </Badge>
          <h2 className="text-2xl font-headline font-black uppercase tracking-widest text-secondary">
            Guardian Feed Locked
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Subscribe as a verified monthly Sanctuary Guardian to access our live, subscriber-only updates channel featuring direct media logs from our duck operations.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black text-xs tracking-widest uppercase rounded-xl shadow-lg px-8 py-4 h-auto hover:scale-105 transition-transform">
            <Link href="/support">Become a Guardian</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-headline font-black uppercase tracking-[0.2em] text-foreground">
            Guardian Live Feed
          </h2>
          <p className="text-[10px] text-muted-foreground font-semibold">
            Subscriber-exclusive real-time logs synchronized from social updates
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest animate-pulse font-bold">
          Loading subscriber feed...
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card border-border border-2 rounded-[2rem] overflow-hidden shadow-xl hover:border-primary/30 transition-all flex flex-col group">
              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.timestamp ? `${formatDistanceToNow(new Date(post.timestamp))} ago` : 'Recent'}
                  </div>
                  <Badge variant="secondary" className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    Source: {post.source_platform}
                  </Badge>
                </div>

                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap text-left">
                  {post.content_text}
                </p>

                {post.media_urls.length > 0 && (
                  <div className={cn(
                    "grid gap-3 pt-2",
                    post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    {post.media_urls.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative aspect-video w-full rounded-xl overflow-hidden border border-border shadow-md bg-muted">
                        <Image 
                          src={url} 
                          alt="Subscriber update media" 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-[2rem] p-12 text-center space-y-3 bg-primary/5">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-60" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            No updates logged yet
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold max-w-sm mx-auto leading-relaxed">
            Exclusive duck updates, media assets, and social logs will be synchronized here in real-time. Stay tuned!
          </p>
        </div>
      )}
    </div>
  );
}
