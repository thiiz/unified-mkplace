'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileVideo, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export type MediaItem = {
  type: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  filename: string;
  size: number;
  mimeType: string;
  file?: File; // For preview before upload
};

interface MediaUploaderProps {
  value?: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  disabled?: boolean;
}

export function MediaUploader({
  value = [],
  onChange,
  disabled
}: MediaUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const newMedia: MediaItem[] = acceptedFiles.map((file) => ({
        type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        url: URL.createObjectURL(file), // Local preview URL
        thumbnailUrl: file.type.startsWith('video/')
          ? undefined
          : URL.createObjectURL(file),
        publicId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        file // Store the actual file for later upload
      }));

      onChange([...value, ...newMedia]);
    },
    [disabled, onChange, value]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    disabled: disabled,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const removeMedia = (index: number) => {
    const newValue = [...value];
    // Revoke object URL to avoid memory leaks
    if (newValue[index].file && newValue[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newValue[index].url);
    }
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;

    const newValue = [...value];
    const [movedItem] = newValue.splice(fromIndex, 1);
    newValue.splice(toIndex, 0, movedItem);
    onChange(newValue);
  };

  return (
    <div className='space-y-4'>
      <div
        {...getRootProps()}
        className={cn(
          'hover:bg-muted/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-muted/50'
            : 'border-muted-foreground/25',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className='flex flex-col items-center gap-2'>
          <Upload className='text-muted-foreground h-8 w-8' />
          <div className='w-full max-w-xs space-y-2'>
            <p className='text-sm font-medium'>
              Drag & drop images or videos here, or click to select
            </p>
            <p className='text-muted-foreground text-xs'>
              Supports JPG, PNG, WEBP, MP4, WEBM (max 100MB)
            </p>
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {value.map((item, index) => (
            <div
              key={item.publicId || index}
              className='group bg-background relative aspect-square overflow-hidden rounded-lg border'
            >
              {item.type === 'VIDEO' ? (
                <div className='relative h-full w-full bg-black/5'>
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center'>
                      <FileVideo className='text-muted-foreground h-10 w-10' />
                    </div>
                  )}
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                    <div className='rounded-full bg-black/50 p-2'>
                      <FileVideo className='h-4 w-4 text-white' />
                    </div>
                  </div>
                </div>
              ) : (
                <div className='relative h-full w-full'>
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className='object-cover'
                  />
                </div>
              )}

              {/* Overlay Actions */}
              <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(index);
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              {/* Order Controls */}
              <div className='absolute right-0 bottom-0 left-0 flex justify-between bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100'>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 text-white hover:bg-white/20 hover:text-white'
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveMedia(index, index - 1);
                  }}
                >
                  ←
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 text-white hover:bg-white/20 hover:text-white'
                  disabled={index === value.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveMedia(index, index + 1);
                  }}
                >
                  →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
