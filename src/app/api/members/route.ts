import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'members-data.json');

// GET - Üye verilerini getir
export async function GET(request: NextRequest) {
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

    const data = fs.readFileSync(dataFilePath, 'utf8');
    const members = JSON.parse(data);
    
    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error('Error reading members:', error);
    return NextResponse.json(
      { error: 'Üye verileri okunamadı.' },
      { status: 500 }
    );
  }
}

// POST - Tüm üyeleri güncelle veya yeni ekle
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
    const { members } = body;

    if (!members) {
      return NextResponse.json(
        { error: 'Üye verisi gerekli.' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    const newData = { members };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Üye başarıyla eklendi.',
        data: newData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating members:', error);
    return NextResponse.json(
      { error: 'Üye eklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT - Tek bir üye güncelle
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
    const { id, firstName, lastName, phone, level, registrationDate, payments, notes, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Üye ID gerekli.' },
        { status: 400 }
      );
    }

    // Mevcut veriyi oku
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const membersData = JSON.parse(data);

    // Üyeyi bul ve güncelle
    const memberIndex = membersData.members.findIndex((m: any) => m.id === parseInt(id));
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Üye bulunamadı.' },
        { status: 404 }
      );
    }

    membersData.members[memberIndex] = {
      ...membersData.members[memberIndex],
      firstName,
      lastName,
      phone,
      level,
      registrationDate,
      payments: payments || membersData.members[memberIndex].payments,
      notes: notes || '',
      isActive: isActive !== undefined ? isActive : true
    };

    // Kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(membersData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Üye başarıyla güncellendi.',
        data: membersData.members[memberIndex]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'Üye güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE - Üye sil
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
        { error: 'Üye ID gerekli.' },
        { status: 400 }
      );
    }

    // Mevcut veriyi oku
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const membersData = JSON.parse(data);

    // Üyeyi bul
    const memberToDelete = membersData.members.find((m: any) => m.id === parseInt(id));
    
    if (!memberToDelete) {
      return NextResponse.json(
        { error: 'Üye bulunamadı.' },
        { status: 404 }
      );
    }

    // JSON'dan kaldır
    membersData.members = membersData.members.filter((m: any) => m.id !== parseInt(id));

    // Kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(membersData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Üye başarıyla silindi.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'Üye silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
