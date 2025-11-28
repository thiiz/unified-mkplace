'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, media } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete existing media for this product
    await prisma.productMedia.deleteMany({
      where: { productId }
    });

    // Create new media records
    if (media && media.length > 0) {
      await prisma.productMedia.createMany({
        data: media.map((m: any, index: number) => ({
          productId,
          type: m.type,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl || m.url,
          publicId: m.publicId,
          filename: m.filename,
          size: m.size,
          mimeType: m.mimeType,
          order: index
        }))
      });
    }

    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/marketplaces/shopee');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product media:', error);
    return NextResponse.json(
      { error: 'Failed to update product media' },
      { status: 500 }
    );
  }
}
