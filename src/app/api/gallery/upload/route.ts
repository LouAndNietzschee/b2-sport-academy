import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

// POST - Dosya yükle
export async function POST(request: NextRequest) {
  try {
    // Admin kontrolü
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli.' },
        { status: 401 }
      );
    }

    const verified = await verifyToken(token);
    if (!verified || verified.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi.' },
        { status: 400 }
      );
    }

    // Dosya kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir (JPG, PNG, WEBP, GIF).' },
        { status: 400 }
      );
    }

    // Maksimum dosya boyutu: 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Dosya boyutu maksimum 5MB olabilir.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `gallery_${timestamp}.${extension}`;
    
    // Galeri klasörü
    const uploadDir = path.join(process.cwd(), 'public', 'photo', 'galeri');
    
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    
    // Dosyayı kaydet
    await writeFile(filepath, buffer);

    // URL path'i
    const urlPath = `/photo/galeri/${filename}`;

    // Gallery data'yı güncelle
    const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'gallery-data.json');
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const gallery = JSON.parse(data);

    // Yeni ID oluştur
    const newId = gallery.images.length > 0 
      ? Math.max(...gallery.images.map((img: any) => img.id)) + 1 
      : 1;

    const newImage = {
      id: newId,
      filename: filename,
      path: urlPath,
      order: gallery.images.length + 1
    };

    gallery.images.push(newImage);

    // JSON'u kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(gallery, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true,
        message: 'Dosya başarıyla yüklendi.',
        image: newImage
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
