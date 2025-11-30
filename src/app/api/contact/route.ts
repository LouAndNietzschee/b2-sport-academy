import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'contact-data.json');

// GET - İletişim bilgilerini getir
export async function GET(request: NextRequest) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const contactData = JSON.parse(data);
    
    return NextResponse.json(contactData, { status: 200 });
  } catch (error) {
    console.error('Error reading contact data:', error);
    return NextResponse.json(
      { error: 'İletişim bilgileri okunamadı.' },
      { status: 500 }
    );
  }
}

// PUT - İletişim bilgilerini güncelle (Admin only)
export async function PUT(request: NextRequest) {
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
    const { contact } = body;

    if (!contact) {
      return NextResponse.json(
        { error: 'İletişim verisi gerekli.' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    const newData = { contact };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'İletişim bilgileri başarıyla güncellendi.',
        data: newData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'İletişim bilgileri güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
