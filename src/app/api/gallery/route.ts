import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'gallery-data.json');

// GET - Galeri verilerini getir
export async function GET(request: NextRequest) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const gallery = JSON.parse(data);
    
    return NextResponse.json(gallery, { status: 200 });
  } catch (error) {
    console.error('Error reading gallery:', error);
    return NextResponse.json(
      { error: 'Galeri verileri okunamadı.' },
      { status: 500 }
    );
  }
}

// POST - Yeni görsel ekle veya güncelle
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

    const body = await request.json();
    const { images } = body;

    if (!images) {
      return NextResponse.json(
        { error: 'Galeri verisi gerekli.' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    const newData = { images };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Galeri başarıyla güncellendi.',
        data: newData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json(
      { error: 'Galeri güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE - Görsel sil
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Görsel ID gerekli.' },
        { status: 400 }
      );
    }

    // Mevcut veriyi oku
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const gallery = JSON.parse(data);

    // Görseli bul ve sil
    const imageToDelete = gallery.images.find((img: any) => img.id === parseInt(id));
    
    if (!imageToDelete) {
      return NextResponse.json(
        { error: 'Görsel bulunamadı.' },
        { status: 404 }
      );
    }

    // Dosyayı sil (public klasöründen)
    const publicPath = path.join(process.cwd(), 'public', imageToDelete.path);
    if (fs.existsSync(publicPath)) {
      fs.unlinkSync(publicPath);
    }

    // JSON'dan kaldır
    gallery.images = gallery.images.filter((img: any) => img.id !== parseInt(id));

    // Kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(gallery, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Görsel başarıyla silindi.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Görsel silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
