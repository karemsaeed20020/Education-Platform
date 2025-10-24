// components/VideoSelectionModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, Search, Video, Clock, Loader2 } from 'lucide-react';

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  grade: string;
  chapter: string;
  createdAt: string;
}

interface VideoSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (video: Video) => void;
  selectedVideos: string[];
}

export function VideoSelectionModal({ isOpen, onClose, onSelect, selectedVideos }: VideoSelectionModalProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVideos();
    }
  }, [isOpen]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/videos', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setVideos(data.data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isVideoSelected = (videoId: string) => selectedVideos.includes(videoId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>اختر الفيديوهات</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="ابحث في الفيديوهات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-1">
                {filteredVideos.map((video) => (
                  <div
                    key={video._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isVideoSelected(video._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => onSelect(video)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                          {Math.round(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            {video.title}
                          </h3>
                          {isVideoSelected(video._id) && (
                            <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>{video.grade}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{Math.round(video.duration / 60)} دقيقة</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {video.chapter}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredVideos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'لا توجد فيديوهات مطابقة للبحث' : 'لا توجد فيديوهات متاحة'}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}