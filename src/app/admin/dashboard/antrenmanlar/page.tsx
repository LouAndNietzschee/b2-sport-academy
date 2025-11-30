'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface ScheduleData {
  [time: string]: {
    [day: string]: string;
  };
}

interface User {
  username: string;
  role: string;
}

const DAYS = ['pazartesi', 'sali', 'çarşamba', 'perşembe', 'cuma', 'cumartesi', 'pazar'];
const DAY_LABELS: { [key: string]: string } = {
  'pazartesi': 'PAZARTESİ',
  'sali': 'SALI',
  'çarşamba': 'ÇARŞAMBA',
  'perşembe': 'PERŞEMBE',
  'cuma': 'CUMA',
  'cumartesi': 'CUMARTESİ',
  'pazar': 'PAZAR'
};

export default function AntrenmanlarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editMode, setEditMode] = useState<{ time: string; day: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadPrograms();
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

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || {});
      } else {
        showMessage('error', 'Program verileri yüklenemedi.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const savePrograms = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Program başarıyla kaydedildi!');
      } else {
        showMessage('error', data.error || 'Kaydetme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCellClick = (time: string, day: string) => {
    setEditMode({ time, day });
    setEditValue(schedule[time]?.[day] || '');
  };

  const handleCellSave = () => {
    if (editMode) {
      const newSchedule = { ...schedule };
      if (!newSchedule[editMode.time]) {
        newSchedule[editMode.time] = {};
      }
      newSchedule[editMode.time][editMode.day] = editValue;
      setSchedule(newSchedule);
      setEditMode(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditMode(null);
    setEditValue('');
  };

  const addNewTime = () => {
    const newTime = prompt('Yeni saat ekle (örn: 18:00):');
    if (newTime && !schedule[newTime]) {
      const newSchedule = { ...schedule };
      newSchedule[newTime] = {};
      DAYS.forEach(day => {
        newSchedule[newTime][day] = '';
      });
      setSchedule(newSchedule);
      showMessage('success', `${newTime} saati eklendi.`);
    } else if (newTime) {
      showMessage('error', 'Bu saat zaten mevcut.');
    }
  };

  const deleteTime = (time: string) => {
    if (confirm(`${time} saatini silmek istediğinize emin misiniz?`)) {
      const newSchedule = { ...schedule };
      delete newSchedule[time];
      setSchedule(newSchedule);
      showMessage('success', `${time} saati silindi.`);
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

  const sortedTimes = Object.keys(schedule).sort();

  return (
    <AdminLayout user={user || undefined}>
      <div className="p-8" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Antrenman Programı Yönetimi</h1>
          <p className="text-gray-400">Program tablosunu düzenleyebilir ve güncelleyebilirsiniz.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={addNewTime}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Saat Ekle</span>
          </button>
          <button
            onClick={savePrograms}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Değişiklikleri Kaydet</span>
              </>
            )}
          </button>
        </div>
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
              <li>Hücreye tıklayarak antrenman adını düzenleyebilirsiniz</li>
              <li>Boş bırakmak için hücreyi temizleyin ve kaydedin</li>
              <li>"Saat Ekle" butonu ile yeni saat dilimi ekleyebilirsiniz</li>
              <li>Saat satırını silmek için çöp kutusu ikonuna tıklayın</li>
              <li>Değişiklikleri yaptıktan sonra "Değişiklikleri Kaydet" butonuna tıklayın</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 border-b border-gray-700">
                  SAAT
                </th>
                {DAYS.map(day => (
                  <th key={day} className="px-6 py-4 text-center text-sm font-semibold text-gray-300 border-b border-gray-700">
                    {DAY_LABELS[day]}
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 border-b border-gray-700">
                  İŞLEM
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTimes.map((time, timeIndex) => (
                <tr key={time} className={timeIndex % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}>
                  <td className="px-6 py-4 font-medium text-white border-b border-gray-700/50">
                    {time}
                  </td>
                  {DAYS.map(day => {
                    const isEditing = editMode?.time === time && editMode?.day === day;
                    const value = schedule[time]?.[day] || '';
                    
                    return (
                      <td key={`${time}-${day}`} className="px-6 py-4 border-b border-gray-700/50">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave();
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Antrenman adı"
                              autoFocus
                            />
                            <button
                              onClick={handleCellSave}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded text-white"
                              title="Kaydet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCellCancel}
                              className="p-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
                              title="İptal"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleCellClick(time, day)}
                            className="text-center text-gray-300 cursor-pointer hover:bg-gray-700/30 rounded p-2 transition-colors min-h-[40px] flex items-center justify-center"
                          >
                            {value || (
                              <span className="text-gray-500 text-sm italic">Boş - Düzenle</span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 border-b border-gray-700/50 text-center">
                    <button
                      onClick={() => deleteTime(time)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                      title="Saati Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Site Önizlemesi</span>
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Değişikliklerinizi kaydettikten sonra, ana sayfada bu şekilde görünecektir.
        </p>
        <div className="bg-black rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white text-center mb-6">PROGRAM</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 border border-gray-800"></th>
                  {DAYS.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-gray-400 border border-gray-800">
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTimes.map(time => (
                  <tr key={time}>
                    <td className="px-4 py-3 text-gray-400 border border-gray-800">{time}</td>
                    {DAYS.map(day => (
                      <td key={`${time}-${day}`} className="px-4 py-3 text-center text-gray-300 border border-gray-800">
                        {schedule[time]?.[day] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
