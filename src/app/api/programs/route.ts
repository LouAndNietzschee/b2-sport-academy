import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'program-data.json');

// GET - Program verilerini getir
export async function GET(request: NextRequest) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const programs = JSON.parse(data);
    
    return NextResponse.json(programs, { status: 200 });
  } catch (error) {
    console.error('Error reading programs:', error);
    return NextResponse.json(
      { error: 'Program verileri okunamadı.' },
      { status: 500 }
    );
  }
}

// POST - Program verilerini güncelle
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
    const { schedule } = body;

    if (!schedule) {
      return NextResponse.json(
        { error: 'Program verisi gerekli.' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    const newData = { schedule };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Program başarıyla güncellendi.',
        data: newData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating programs:', error);
    return NextResponse.json(
      { error: 'Program güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
