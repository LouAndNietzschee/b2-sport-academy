'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface User {
  username: string;
  role: string;
}

export default function SorularPage() {
  const [user, setUser] = useState<User | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadFAQs();
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

  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        showMessage('error', 'FAQ verileri yüklenemedi.');
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

  const handleAddNew = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showMessage('error', 'Soru ve cevap alanları boş bırakılamaz.');
      return;
    }

    try {
      const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;
      const newFaq: FAQ = {
        id: newId,
        question: newQuestion,
        answer: newAnswer,
        order: faqs.length + 1
      };

      const updatedFaqs = [...faqs, newFaq];

      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faqs: updatedFaqs }),
      });

      if (response.ok) {
        showMessage('success', 'Yeni soru başarıyla eklendi!');
        setFaqs(updatedFaqs);
        setIsAddingNew(false);
        setNewQuestion('');
        setNewAnswer('');
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Ekleme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleUpdate = async () => {
    if (!editingFaq) return;

    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      showMessage('error', 'Soru ve cevap alanları boş bırakılamaz.');
      return;
    }

    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingFaq.id,
          question: editingFaq.question,
          answer: editingFaq.answer,
        }),
      });

      if (response.ok) {
        showMessage('success', 'Soru başarıyla güncellendi!');
        await loadFAQs();
        setEditingFaq(null);
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Güncelleme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (faq: FAQ) => {
    if (!confirm(`"${faq.question}" sorusunu silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/faq?id=${faq.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Soru başarıyla silindi!');
        await loadFAQs();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Silme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleReorder = async (dragIndex: number, dropIndex: number) => {
    const updatedFaqs = [...faqs];
    const [draggedFaq] = updatedFaqs.splice(dragIndex, 1);
    updatedFaqs.splice(dropIndex, 0, draggedFaq);

    // Update order values
    updatedFaqs.forEach((faq, index) => {
      faq.order = index + 1;
    });

    setFaqs(updatedFaqs);

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faqs: updatedFaqs }),
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
            <h1 className="text-3xl font-bold text-white mb-2">Sıkça Sorulan Sorular Yönetimi</h1>
            <p className="text-gray-400">Soruları ekleyin, düzenleyin veya silin.</p>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yeni Soru Ekle</span>
          </button>
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
                <li>"Yeni Soru Ekle" butonu ile yeni soru-cevap ekleyin</li>
                <li>"Düzenle" butonu ile mevcut soruyu değiştirin</li>
                <li>"Sil" butonu ile soruyu kaldırın</li>
                <li>Soruları sürükleyerek sıralamayı değiştirin</li>
                <li>Değişiklikler otomatik olarak ana sayfada görünür</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add New FAQ Form */}
        {isAddingNew && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Yeni Soru Ekle</h3>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewQuestion('');
                  setNewAnswer('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Soru</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Soruyu girin..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cevap</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Cevabı girin..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewQuestion('');
                    setNewAnswer('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleAddNew}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        {faqs.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Henüz soru yok</h3>
            <p className="text-gray-500 mb-4">İlk soruyu eklemek için yukarıdaki butonu kullanın.</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              İlk Soruyu Ekle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.sort((a, b) => a.order - b.order).map((faq, index) => (
              <div
                key={faq.id}
                draggable
                onDragStart={() => {}}
                className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all"
              >
                {editingFaq?.id === faq.id ? (
                  // Edit Mode
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Soruyu Düzenle</h3>
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Soru</label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cevap</label>
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setEditingFaq(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          onClick={handleUpdate}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          Güncelle
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full">
                            #{faq.order}
                          </span>
                          <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingFaq(faq)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                          title="Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(faq)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
