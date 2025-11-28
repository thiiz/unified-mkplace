'use server';

import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteProductMedia(mediaId: string) {
  try {
    // Get media info to delete from Cloudinary
    const media = await prisma.productMedia.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.type === 'VIDEO' ? 'video' : 'image'
    });

    // Delete from database
    await prisma.productMedia.delete({
      where: { id: mediaId }
    });

    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete media:', error);
    throw error;
  }
}

export async function reorderProductMedia(
  productId: string,
  mediaIds: string[]
) {
  try {
    // Update order for each media
    await Promise.all(
      mediaIds.map((id, index) =>
        prisma.productMedia.update({
          where: { id },
          data: { order: index }
        })
      )
    );

    revalidatePath('/dashboard/products');

    return { success: true };
  } catch (error) {
    console.error('Failed to reorder media:', error);
    throw error;
  }
}
