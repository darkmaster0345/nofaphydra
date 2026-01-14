import React, { useState } from 'react';
import { Camera, Loader2, UploadCloud } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
    currentAvatar?: string;
    onUploadSuccess: (url: string) => void;
}

export const AvatarUpload = ({ currentAvatar, onUploadSuccess }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file', description: 'Please upload an image.', variant: 'destructive' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('fileToUpload', file);
        formData.append('submit', 'Upload Image');

        try {
            // Using nostr.build simple upload API
            const response = await fetch('https://nostr.build/api/v2/upload/files', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            console.log('Upload result:', result);

            // nostr.build v2 response structure varies, typically has data[0].url
            const url = result.data?.[0]?.url || result.url;
            if (url) {
                onUploadSuccess(url);
                toast({ title: 'Success', description: 'Profile picture updated.' });
            } else {
                throw new Error('Url not found in response');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: 'Could not upload to nostr.build', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 flex items-center justify-center">
                {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <Camera className="w-8 h-8 text-gray-400" />
                )}
            </div>

            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
            </label>
        </div>
    );
};
