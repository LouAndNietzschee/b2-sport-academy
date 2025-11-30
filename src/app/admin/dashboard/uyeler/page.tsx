'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface Payment {
  id: number;
  date: string;
  amount: number;
  period: string;
  note?: string;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  level: 'Başlangıç' | 'Orta' | 'İleri';
  registrationDate: string;
  payments: Payment[];
  notes?: string;
  isActive: boolean;
}

interface User {
  username: string;
  role: string;
}

export default function UyelerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    level: 'Başlangıç' as 'Başlangıç' | 'Orta' | 'İleri',
    registrationDate: new Date().toISOString().split('T')[0],
    notes: '',
    isActive: true
  });
  
  // Payment form states
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 1000,
    period: '',
    note: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadMembers();
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

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        showMessage('error', 'Üye verileri yüklenemedi.');
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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      level: 'Başlangıç',
      registrationDate: new Date().toISOString().split('T')[0],
      notes: '',
      isActive: true
    });
  };

  const handleAddMember = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      showMessage('error', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      const newId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
      const newMember: Member = {
        id: newId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        level: formData.level,
        registrationDate: formData.registrationDate,
        notes: formData.notes,
        isActive: formData.isActive,
        payments: []
      };

      const updatedMembers = [...members, newMember];

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: updatedMembers }),
      });

      if (response.ok) {
        showMessage('success', 'Üye başarıyla eklendi!');
        setMembers(updatedMembers);
        setShowAddModal(false);
        resetForm();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Ekleme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      showMessage('error', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedMember.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          level: formData.level,
          registrationDate: formData.registrationDate,
          notes: formData.notes,
          isActive: formData.isActive,
          payments: selectedMember.payments
        }),
      });

      if (response.ok) {
        showMessage('success', 'Üye başarıyla güncellendi!');
        await loadMembers();
        setShowEditModal(false);
        setSelectedMember(null);
        resetForm();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Güncelleme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`${member.firstName} ${member.lastName} üyesini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/members?id=${member.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Üye başarıyla silindi!');
        await loadMembers();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Silme başarısız.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const handleAddPayment = async () => {
    if (!selectedMember || !paymentData.period) {
      showMessage('error', 'Lütfen ödeme dönemini seçin.');
      return;
    }

    try {
      const newPaymentId = selectedMember.payments.length > 0 
        ? Math.max(...selectedMember.payments.map(p => p.id)) + 1 
        : 1;

      const newPayment: Payment = {
        id: newPaymentId,
        ...paymentData
      };

      const updatedPayments = [...selectedMember.payments, newPayment];

      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedMember.id,
          firstName: selectedMember.firstName,
          lastName: selectedMember.lastName,
          phone: selectedMember.phone,
          level: selectedMember.level,
          registrationDate: selectedMember.registrationDate,
          payments: updatedPayments,
          notes: selectedMember.notes
        }),
      });

      if (response.ok) {
        showMessage('success', 'Ödeme başarıyla eklendi!');
        await loadMembers();
        setShowPaymentModal(false);
        setPaymentData({
          date: new Date().toISOString().split('T')[0],
          amount: 1000,
          period: '',
          note: ''
        });
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'Ödeme eklenemedi.');
      }
    } catch (error) {
      showMessage('error', 'Bir hata oluştu.');
    }
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      level: member.level,
      registrationDate: member.registrationDate,
      notes: member.notes || '',
      isActive: member.isActive !== undefined ? member.isActive : true
    });
    setShowEditModal(true);
  };

  const openDetailModal = (member: Member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const openPaymentModal = (member: Member) => {
    setSelectedMember(member);
    setShowPaymentModal(true);
  };

  // Üye durumunu hesapla (manuel kontrol veya son ödeme tarihine göre)
  const getMemberStatus = (member: Member) => {
    // Önce manuel aktif/pasif kontrolü
    if (member.isActive === false) return 'inactive';
    
    // Manuel olarak aktifse, ödeme durumuna bak
    if (member.payments.length === 0) return 'unpaid';
    
    const lastPayment = member.payments.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const lastPaymentDate = new Date(lastPayment.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 30) return 'active';
    if (daysDiff <= 45) return 'warning';
    return 'inactive';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">Aktif</span>;
      case 'warning':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">Uyarı</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">Pasif</span>;
      case 'unpaid':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">Ödeme Yok</span>;
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: { [key: string]: string } = {
      'Başlangıç': 'bg-blue-500/20 text-blue-400',
      'Orta': 'bg-purple-500/20 text-purple-400',
      'İleri': 'bg-orange-500/20 text-orange-400'
    };
    
    return <span className={`px-3 py-1 ${colors[level]} text-xs font-semibold rounded-full`}>{level}</span>;
  };

  // Filtreleme
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm);
    
    const matchesLevel = filterLevel === 'all' || member.level === filterLevel;
    const matchesStatus = filterStatus === 'all' || getMemberStatus(member) === filterStatus;
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold text-white mb-2">Üye Yönetimi</h1>
            <p className="text-gray-400">Üyeleri ekleyin, düzenleyin ve ödemelerini takip edin.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yeni Üye Ekle</span>
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

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ara</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="İsim, telefon ara..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Seviye</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="Başlangıç">Başlangıç</option>
                <option value="Orta">Orta</option>
                <option value="İleri">İleri</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="warning">Uyarı</option>
                <option value="inactive">Pasif</option>
                <option value="unpaid">Ödeme Yok</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Toplam Üye</span>
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{members.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Aktif Üye</span>
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">
              {members.filter(m => getMemberStatus(m) === 'active').length}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100 text-sm font-medium">Uyarı</span>
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">
              {members.filter(m => getMemberStatus(m) === 'warning').length}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100 text-sm font-medium">Pasif Üye</span>
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">
              {members.filter(m => getMemberStatus(m) === 'inactive' || getMemberStatus(m) === 'unpaid').length}
            </p>
          </div>
        </div>

        {/* Members Table/Cards */}
        {filteredMembers.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Üye bulunamadı</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterLevel !== 'all' || filterStatus !== 'all' 
                ? 'Filtrelerinize uygun üye bulunamadı.' 
                : 'Henüz üye eklenmemiş. İlk üyeyi eklemek için yukarıdaki butonu kullanın.'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900/50 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Üye</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Telefon</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Seviye</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Kayıt Tarihi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Son Ödeme</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member, index) => {
                    const status = getMemberStatus(member);
                    const lastPayment = member.payments.length > 0 
                      ? member.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                      : null;
                    
                    return (
                      <tr
                        key={member.id}
                        className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-800/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-semibold">
                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{member.firstName} {member.lastName}</p>
                              <p className="text-gray-400 text-sm">{member.payments.length} ödeme</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{member.phone}</td>
                        <td className="px-6 py-4">{getLevelBadge(member.level)}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(member.registrationDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(status)}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {lastPayment ? new Date(lastPayment.date).toLocaleDateString('tr-TR') : 'Yok'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => openDetailModal(member)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                              title="Detaylar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openPaymentModal(member)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                              title="Ödeme Ekle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(member)}
                              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors"
                              title="Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                              title="Sil"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
                <h3 className="text-2xl font-bold text-white">Yeni Üye Ekle</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ahmet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Soyad *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+90 532 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Seviye</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Başlangıç">Başlangıç</option>
                      <option value="Orta">Orta</option>
                      <option value="İleri">İleri</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kayıt Tarihi</label>
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Üye hakkında notlar..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Üyelik Durumu</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                          formData.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            formData.isActive ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${formData.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {formData.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {formData.isActive 
                        ? 'Üye aktif olarak işaretlenecek' 
                        : 'Üye pasif olarak işaretlenecek (ödeme durumuna bakılmaksızın)'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal - Similar structure to Add Modal */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
                <h3 className="text-2xl font-bold text-white">Üye Düzenle</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Soyad *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Seviye</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Başlangıç">Başlangıç</option>
                      <option value="Orta">Orta</option>
                      <option value="İleri">İleri</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kayıt Tarihi</label>
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notlar</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Üyelik Durumu</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                          formData.isActive ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            formData.isActive ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${formData.isActive ? 'text-green-400' : 'text-gray-400'}`}>
                        {formData.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {formData.isActive 
                        ? 'Üye aktif olarak işaretlenecek' 
                        : 'Üye pasif olarak işaretlenecek (ödeme durumuna bakılmaksızın)'}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleUpdateMember}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMember.firstName} {selectedMember.lastName}</h3>
                    <p className="text-gray-400">{selectedMember.phone}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {/* Member Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Seviye</p>
                    <div>{getLevelBadge(selectedMember.level)}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Durum</p>
                    <div>{getStatusBadge(getMemberStatus(selectedMember))}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Kayıt Tarihi</p>
                    <p className="text-white font-medium">{new Date(selectedMember.registrationDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Toplam Ödeme</p>
                    <p className="text-white font-medium">₺{selectedMember.payments.reduce((sum, p) => sum + p.amount, 0)}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 col-span-2">
                    <p className="text-gray-400 text-sm mb-2">Üyelik Durumu (Manuel)</p>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${selectedMember.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`font-medium ${selectedMember.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedMember.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {selectedMember.isActive 
                          ? '(Üye manuel olarak aktif işaretli)' 
                          : '(Üye manuel olarak pasif işaretli)'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMember.notes && (
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                    <p className="text-gray-400 text-sm mb-2">Notlar</p>
                    <p className="text-white">{selectedMember.notes}</p>
                  </div>
                )}

                {/* Payment History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">Ödeme Geçmişi</h4>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openPaymentModal(selectedMember);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Ödeme Ekle</span>
                    </button>
                  </div>
                  {selectedMember.payments.length === 0 ? (
                    <div className="bg-gray-700/30 rounded-lg p-8 text-center">
                      <p className="text-gray-400">Henüz ödeme kaydı yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedMember.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
                        <div key={payment.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-white font-medium">₺{payment.amount}</p>
                              <p className="text-gray-400 text-sm">{new Date(payment.date).toLocaleDateString('tr-TR')} - {payment.period}</p>
                              {payment.note && <p className="text-gray-500 text-sm">{payment.note}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
            <div className="bg-gray-800 rounded-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Ödeme Ekle</h3>
                  <p className="text-gray-400 text-sm">{selectedMember.firstName} {selectedMember.lastName}</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ödeme Tarihi *</label>
                    <input
                      type="date"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tutar (₺) *</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ödeme Dönemi (YYYY-MM) *</label>
                    <input
                      type="month"
                      value={paymentData.period}
                      onChange={(e) => setPaymentData({ ...paymentData, period: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Not</label>
                    <input
                      type="text"
                      value={paymentData.note}
                      onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                      placeholder="Ödeme notu (opsiyonel)"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddPayment}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
