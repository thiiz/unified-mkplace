import cloudinary from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          resource_type: isVideo ? 'video' : 'image',
          // For images, create optimized versions
          transformation: isImage
            ? [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1200, height: 1200, crop: 'limit' }
              ]
            : undefined,
          // For videos, generate thumbnail
          eager: isVideo
            ? [
                {
                  width: 300,
                  height: 300,
                  crop: 'pad',
                  audio_codec: 'none',
                  format: 'jpg'
                }
              ]
            : undefined,
          eager_async: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    // Extract metadata
    const mediaData = {
      type: isVideo ? 'VIDEO' : 'IMAGE',
      url: result.secure_url,
      thumbnailUrl:
        isVideo && result.eager?.[0]?.secure_url
          ? result.eager[0].secure_url
          : result.secure_url,
      publicId: result.public_id,
      filename: file.name,
      size: file.size,
      mimeType: file.type
    };

    return NextResponse.json(mediaData);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
