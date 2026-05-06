'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { MediaService } from '@/features/Media/services/MediaService';
import { useEffect, useRef, useState } from 'react';

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (media: { id: string, url: string }) => void;
}

export const MediaPicker = ({ open, onOpenChange, onSelect }: MediaPickerProps) => {
    const [mediaList, setMediaList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastMediaElementRef = useRef<HTMLButtonElement>(null);

    const fetchMedia = async (pageNum: number, isNew = false) => {
        if (isNew) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const res = await MediaService.getAll('default', pageNum);
            if (res.status === 'success') {
                const newData = res.data.data;
                setMediaList(prev => isNew ? newData : [...prev, ...newData]);
                setHasMore(res.data.next_page_url !== null);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (open) {
            setPage(1);
            setHasMore(true);
            fetchMedia(1, true);
        }
    }, [open]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (isLoading || isLoadingMore || !hasMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchMedia(nextPage);
                    return nextPage;
                });
            }
        }, { threshold: 0.1 });

        if (lastMediaElementRef.current) {
            observer.current.observe(lastMediaElementRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [isLoading, isLoadingMore, hasMore, mediaList]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await MediaService.upload(file);
            if (res.status === 'success') {
                onSelect({ id: res.data.id, url: res.data.url });
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredMedia = mediaList.filter(m =>
        m.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden bg-white rounded-[2.5rem] border-none shadow-2xl">
                <DialogHeader className="p-8 border-b border-zinc-100 shrink-0">
                    <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight uppercase flex items-center gap-3">
                        <Icon icon="solar:gallery-bold-duotone" className="w-8 h-8 text-blue-500" />
                        <span>Select Asset</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search by asset identity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pl-11 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                            />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="h-12 px-6 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 shrink-0 transition-all active:scale-95 shadow-lg"
                        >
                            {isUploading ? <Icon icon="solar:refresh-bold" className="w-4 h-4 animate-spin" /> : <Icon icon="solar:cloud-upload-bold" className="w-4 h-4" />}
                            <span>Quick Upload</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-bold">Scanning Repository...</span>
                        </div>
                    ) : filteredMedia.length > 0 ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredMedia.map((m, index) => (
                                    <button
                                        key={m.id}
                                        ref={index === filteredMedia.length - 1 ? lastMediaElementRef : null}
                                        onClick={() => onSelect({ id: m.id, url: m.url })}
                                        className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 hover:border-blue-500 transition-all hover:shadow-xl"
                                    >
                                        <img src={m.url} alt="" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                                <Icon icon="solar:check-read-bold" className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                            <p className="text-white text-[8px] font-black uppercase truncate tracking-tighter">{m.original_name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            {isLoadingMore && (
                                <div className="py-8 flex flex-col items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Loading More...</span>
                                </div>
                            )}

                            {!hasMore && filteredMedia.length > 24 && (
                                <div className="py-8 flex flex-col items-center justify-center text-zinc-300">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">End of Repository</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-300">
                            <Icon icon="solar:album-bold-duotone" className="w-20 h-20 opacity-10 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Intelligence Repository Empty</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
