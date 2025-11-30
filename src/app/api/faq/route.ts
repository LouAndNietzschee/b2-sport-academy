import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'faq-data.json');

// GET - FAQ verilerini getir
export async function GET(request: NextRequest) {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const faq = JSON.parse(data);
    
    return NextResponse.json(faq, { status: 200 });
  } catch (error) {
    console.error('Error reading FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ verileri okunamadı.' },
      { status: 500 }
    );
  }
}

// POST - Tüm FAQ'leri güncelle veya yeni ekle
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
    const { faqs } = body;

    if (!faqs) {
      return NextResponse.json(
        { error: 'FAQ verisi gerekli.' },
        { status: 400 }
      );
    }

    // Veriyi kaydet
    const newData = { faqs };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'FAQ başarıyla güncellendi.',
        data: newData
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// PUT - Tek bir FAQ güncelle
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
    const { id, question, answer } = body;

    if (!id || !question || !answer) {
      return NextResponse.json(
        { error: 'ID, soru ve cevap gerekli.' },
        { status: 400 }
      );
    }

    // Mevcut veriyi oku
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const faqData = JSON.parse(data);

    // FAQ'i bul ve güncelle
    const faqIndex = faqData.faqs.findIndex((f: any) => f.id === parseInt(id));
    
    if (faqIndex === -1) {
      return NextResponse.json(
        { error: 'FAQ bulunamadı.' },
        { status: 404 }
      );
    }

    faqData.faqs[faqIndex] = {
      ...faqData.faqs[faqIndex],
      question,
      answer
    };

    // Kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(faqData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'FAQ başarıyla güncellendi.',
        data: faqData.faqs[faqIndex]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ güncellenirken hata oluştu.' },
      { status: 500 }
    );
  }
}

// DELETE - FAQ sil
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
        { error: 'FAQ ID gerekli.' },
        { status: 400 }
      );
    }

    // Mevcut veriyi oku
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const faqData = JSON.parse(data);

    // FAQ'i bul
    const faqToDelete = faqData.faqs.find((f: any) => f.id === parseInt(id));
    
    if (!faqToDelete) {
      return NextResponse.json(
        { error: 'FAQ bulunamadı.' },
        { status: 404 }
      );
    }

    // JSON'dan kaldır
    faqData.faqs = faqData.faqs.filter((f: any) => f.id !== parseInt(id));

    // Sıralamayı yeniden düzenle
    faqData.faqs.forEach((faq: any, index: number) => {
      faq.order = index + 1;
    });

    // Kaydet
    fs.writeFileSync(dataFilePath, JSON.stringify(faqData, null, 2), 'utf8');

    return NextResponse.json(
      { 
        success: true, 
        message: 'FAQ başarıyla silindi.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'FAQ silinirken hata oluştu.' },
      { status: 500 }
    );
  }
}
