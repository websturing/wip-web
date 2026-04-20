'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { useEffect, useRef, useState } from 'react';
import { MediaService } from '../services/MediaService';

export const MediaLibrary = () => {
    const [media, setMedia] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedCollection, setSelectedCollection] = useState('default');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [renameTarget, setRenameTarget] = useState<{ id: string, name: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const fetchMedia = async () => {
        setIsLoading(true);
        try {
            const res = await MediaService.getAll(selectedCollection);
            if (res.status === 'success') {
                setMedia(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [selectedCollection]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress({ current: 0, total: files.length });

        for (let i = 0; i < files.length; i++) {
            try {
                await MediaService.upload(files[i], selectedCollection);
                setUploadProgress(prev => ({ ...prev, current: i + 1 }));
            } catch (error) {
                console.error('Upload error for file:', files[i].name, error);
            }
        }

        setIsUploading(false);
        fetchMedia();
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (folderInputRef.current) folderInputRef.current.value = '';
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            const res = await MediaService.delete(showDeleteConfirm);
            if (res.status === 'success') {
                fetchMedia();
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const handleRename = async () => {
        if (!renameTarget) return;
        try {
            const res = await MediaService.update(renameTarget.id, renameTarget.name);
            if (res.status === 'success') {
                fetchMedia();
            }
        } catch (error) {
            console.error('Rename error:', error);
        } finally {
            setRenameTarget(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:gallery-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Media Intelligence</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Centralized Visual Assets Master</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                    />
                    <input
                        type="file"
                        ref={folderInputRef}
                        className="hidden"
                        accept="image/*"
                        /* @ts-ignore */
                        webkitdirectory=""
                        directory=""
                        onChange={handleUpload}
                    />

                    <button
                        onClick={() => folderInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 px-6 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-zinc-50 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Icon icon="solar:folder-open-bold" className="w-4 h-4" />
                        <span>Import Folder</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="h-12 px-8 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isUploading ? (
                            <Icon icon="solar:refresh-bold" className="w-4 h-4 animate-spin" />
                        ) : (
                            <Icon icon="solar:cloud-upload-bold" className="w-4 h-4" />
                        )}
                        <span>{isUploading ? `Uploading (${uploadProgress.current}/${uploadProgress.total})` : 'Upload Assets'}</span>
                    </button>
                </div>
            </div>

            {/* Main Library Grid */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 min-h-[600px]">
                {isLoading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Assets...</span>
                    </div>
                ) : media.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {media.map((item) => (
                            <div key={item.id} className="group relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-50 border border-zinc-100 transition-all hover:shadow-2xl hover:scale-[1.02]">
                                <img
                                    src={item.url}
                                    alt={item.original_name}
                                    className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                                    <p className="text-white text-[10px] font-bold truncate w-full mb-4 px-2 uppercase tracking-tighter">
                                        {item.original_name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => window.open(item.url, '_blank')}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-zinc-900 transition-all"
                                            title="View Fullsize"
                                        >
                                            <Icon icon="solar:eye-bold" className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setRenameTarget({ id: item.id, name: item.original_name })}
                                            className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                                            title="Rename Asset"
                                        >
                                            <Icon icon="solar:pen-bold" className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(item.id)}
                                            className="w-9 h-9 rounded-full bg-red-500/20 backdrop-blur-md text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                            title="Delete Asset"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 h-7 rounded-lg bg-white/90 backdrop-blur shadow-sm flex items-center px-3 opacity-100 group-hover:opacity-0 transition-opacity border border-zinc-100">
                                    <span className="text-[9px] font-black text-zinc-900 truncate uppercase tracking-tighter">{item.original_name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-zinc-300">
                        <Icon icon="solar:album-bold-duotone" className="w-20 h-20 opacity-20 mb-6" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em]">No Visual Assets Found</p>
                    </div>
                )}
            </div>

            {/* Rename Dialog */}
            <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
                <DialogContent className="max-w-md bg-white border-zinc-100 shadow-2xl rounded-[2.5rem] p-10">
                    <DialogHeader>
                        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                            <Icon icon="solar:pen-bold-duotone" className="w-8 h-8 text-blue-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">RENAME ASSET</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                            Update the display name for this intelligence asset.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <input
                            type="text"
                            value={renameTarget?.name || ''}
                            onChange={(e) => setRenameTarget(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full bg-zinc-50 h-14 rounded-2xl px-6 text-sm font-bold text-zinc-900 outline-none border border-zinc-100 focus:border-zinc-900 focus:bg-white transition-all shadow-sm"
                            placeholder="Asset Display Name"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setRenameTarget(null)} className="flex-1 h-14 rounded-2xl border border-zinc-200 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleRename} className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
                            Save Identity
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
                <DialogContent className="max-w-md bg-white border-zinc-100 shadow-2xl rounded-[2.5rem] p-10">
                    <DialogHeader>
                        <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center mb-6">
                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-8 h-8 text-red-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">ERASE ASSET?</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                            This action is permanent. The asset will be removed from all intelligence modules.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 h-14 rounded-2xl border border-zinc-200 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
                            Keep Asset
                        </button>
                        <button onClick={handleDelete} className="flex-[2] h-14 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-2">
                            Delete Permanently
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
