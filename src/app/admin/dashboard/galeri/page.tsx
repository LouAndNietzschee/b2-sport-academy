'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface GalleryImage {
  id: number;
  filename: string;
  path: string;
  order: number;
}

interface User {
  username: string;
  role: string;
}

export default function GaleriPage() {
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [draggedImage, setDraggedImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadGallery();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const loadGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        showMessage('error', 'Galeri yüklenemedi.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Dosya kontrolü
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Lütfen sadece resim dosyası seçin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Dosya boyutu maksimum 5MB olabilir.');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Görsel başarıyla yüklendi!');
        await loadGallery();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        showMessage('error', data.error || 'Yükleme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm(`"${image.filename}" görselini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery?id=${image.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Görsel silindi!');
        await loadGallery();
        setSelectedImage(null);
      } else {
        showMessage('error', data.error || 'Silme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleReplace = async (image: GalleryImage) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // Önce eski görseli sil
      try {
        await fetch(`/api/gallery?id=${image.id}`, {
          method: 'DELETE',
        });
        // Sonra yeni görseli yükle
        await uploadFile(file);
        showMessage('success', 'Görsel değiştirildi!');
      } catch (error) {
        showMessage('error', 'Değiştirme başarısız.');
      }
    };
    input.click();
  };

  const handleDragStart = (image: GalleryImage) => {
    setDraggedImage(image);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetImage: GalleryImage) => {
    if (!draggedImage || draggedImage.id === targetImage.id) {
      setDraggedImage(null);
      return;
    }

    // Sıralamayı değiştir
    const newImages = [...images];
    const draggedIndex = newImages.findIndex(img => img.id === draggedImage.id);
    const targetIndex = newImages.findIndex(img => img.id === targetImage.id);

    newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    // Order değerlerini güncelle
    newImages.forEach((img, index) => {
      img.order = index + 1;
    });

    setImages(newImages);
    setDraggedImage(null);

    // Sunucuya kaydet
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newImages }),
      });

      if (response.ok) {
        showMessage('success', 'Sıralama güncellendi!');
      }
    } catch (error) {
      showMessage('error', 'Sıralama kaydedilemedi.');
    }
  };

  if (loading) {
    return (
      <AdminLayout user={user || undefined}>
        <div className="flex items-center justify-center h-screen" suppressHydrationWarning>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user || undefined}>
      <div className="p-8" suppressHydrationWarning>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Galeri Yönetimi</h1>
            <p className="text-gray-400">Galeri fotoğraflarını ekleyin, silin veya sıralayın.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                <span>Yükleniyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Görsel Ekle</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500 text-green-400' 
              : 'bg-red-500/10 border border-red-500 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-blue-300 text-sm">
              <p className="font-semibold mb-1">Nasıl kullanılır?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"Yeni Görsel Ekle" butonu ile galeri fotoğrafı yükleyin</li>
                <li>Maksimum dosya boyutu: 5MB</li>
                <li>Desteklenen formatlar: JPG, PNG, WEBP, GIF</li>
                <li>Görsele tıklayarak detaylı görünüm açın</li>
                <li>Görselleri sürükleyerek sıralamayı değiştirin</li>
                <li>"Değiştir" butonu ile mevcut görseli yenisiyle değiştirin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Henüz görsel yok</h3>
            <p className="text-gray-500 mb-4">Galeri boş. İlk görseli yüklemek için yukarıdaki butonu kullanın.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              İlk Görseli Yükle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(image)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(image)}
                onClick={() => setSelectedImage(image)}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden cursor-pointer hover:border-blue-500 transition-all transform hover:scale-105 group"
              >
                <div className="relative aspect-square bg-gray-900">
                  <img
                    src={image.path}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplace(image);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                        title="Değiştir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image);
                        }}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                        title="Sil"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-white text-xs font-semibold">
                    #{image.order}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-medium truncate">{image.filename}</p>
                  <p className="text-gray-400 text-sm">Sıra: {image.order}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedImage.filename}</h3>
                  <p className="text-gray-400 text-sm">Sıra: {selectedImage.order}</p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.path}
                  alt={selectedImage.filename}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="p-4 border-t border-gray-700 flex items-center justify-end space-x-3">
                <button
                  onClick={() => handleReplace(selectedImage)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Değiştir</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedImage)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Sil</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
