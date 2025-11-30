'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface ScheduleData {
  [time: string]: {
    [day: string]: string;
  };
}

interface GalleryImage {
  id: number;
  filename: string;
  path: string;
  order: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleData>({});
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [faqList, setFaqList] = useState<FAQ[]>([]);
  const [contactData, setContactData] = useState({
    phone: '+90 540 300 14 34',
    phoneLink: 'https://api.whatsapp.com/send/?phone=905403001434&text&type=phone_number&app_absent=0',
    email: 'info@b2sportacademy.com',
    address: 'Şerifali, Kale Sokağı No: 12G',
    addressDetail: '34775 Ümraniye/İstanbul',
    mapLink: 'https://www.google.com/maps/place//data=!4m2!3m1!1s0x14cacf9b0ec1463f:0xb460ed2d74e84859?sa=X&ved=1t:8290&ictx=111',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.1234567890!2d29.1234567!3d41.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cacf9b0ec1463f%3A0xb460ed2d74e84859!2sB2%20Sport%20Academy!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str&t=m&z=16',
    socialMedia: {
      instagram: 'https://www.instagram.com/b2sportacademy/',
      facebook: 'https://www.facebook.com/profile.php?id=61561467472534&ref=_xav_ig_profile_page_web#'
    }
  });
  
  const fullText = "HERKES İÇİN MMA";

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    loadPrograms();
    loadGallery();
    loadFAQs();
    loadContact();
  }, []);

  // Load program data
  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || {});
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  // Load gallery data
  const loadGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        setGalleryImages(data.images || []);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  // Load FAQ data
  const loadFAQs = async () => {
    try {
      const response = await fetch('/api/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqList(data.faqs || []);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  const loadContact = async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setContactData(data.contact || contactData);
      }
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  // Typing effect
  useEffect(() => {
    if (!isClient) return;
    
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText, isClient]);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-black">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 mr-3">
                <img 
                  src="/photo/logo2.png" 
                  alt="B2 Sports Academy Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-xl font-bold">
                <span className="text-white">B2 SPORT</span>
                <span className="text-white font-normal ml-1">ACADEMY</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('about')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                HAKKIMIZDA
                </button>
                <button onClick={() => scrollToSection('program')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                PROGRAM
                </button>
                <button onClick={() => scrollToSection('gallery')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                GALERİ
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                  S.S.S
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors">
                İLETİŞİM
              </button>
              <a href="https://api.whatsapp.com/send/?phone=905403001434&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="bg-white text-black px-6 py-2 font-semibold text-sm hover:bg-gray-200 transition-colors">
                REZERVASYON
                </a>
            </div>

            

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300 p-2 -mr-2"
                aria-label="Menüyü Aç/Kapat"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-3 pt-3 pb-4 space-y-1 sm:px-4 border-t border-gray-800 bg-black">
                <button onClick={() => scrollToSection('about')} className="text-white hover:text-red-600 block px-3 py-3 text-base font-medium">
                  HAKKIMIZDA
                </button>
                <button onClick={() => scrollToSection('program')} className="text-white hover:text-red-600 block px-3 py-3 text-base font-medium">
                  PROGRAM
                </button>
                <button onClick={() => scrollToSection('gallery')} className="text-white hover:text-red-600 block px-3 py-3 text-base font-medium">
                  GALERİ
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-white hover:text-red-600 block px-3 py-3 text-base font-medium">
                  S.S.S
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-white hover:text-red-600 block px-3 py-3 text-base font-medium">
                  İLETİŞİM
                </button>
                <a href="https://api.whatsapp.com/send/?phone=905403001434&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" className="border border-white text-white px-4 py-3 text-base font-medium hover:bg-white hover:text-black transition-colors mt-2 rounded">
                  REZERVASYON
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen bg-black flex items-center pt-24 sm:pt-28">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - Metin İçeriği */}
            <div className="text-left">
              <h1 className="font-bold leading-tight mb-8">
                <span className="block text-2xl sm:text-4xl lg:text-5xl text-white">HEDEFLERİNİ YÜKSELT</span>
                <span className="block text-2xl sm:text-4xl lg:text-5xl" style={{color: '#ab2328'}}>HAYALLERİNİ GERÇEKLEŞTİR</span>
          </h1>
              
              <div className="space-y-6 mb-8">
                <p className="text-white text-lg leading-relaxed">
                  B2 Sport Academy'de yaş, cinsiyet seviye fark etmeksizin herkes için disiplinli ve güçlü dövüş antrenmanları. İlk adımı atanlardan profesyonellere kadar herkes burada kendi potansiyelini keşfeder.
                </p>
              </div>
              
          <button 
            onClick={() => scrollToSection('contact')}
                className="bg-black text-white border border-white px-8 py-4 font-light text-lg hover:bg-gray-800 transition-colors rounded-lg"
          >
                DENEME DERSİ İÇİN
          </button>
            </div>
            
            {/* Sağ Taraf - Görsel İçerik */}
            <div className="relative">
              <div 
                className="w-full bg-cover rounded-lg mt-6 h-[60vh] sm:h-[70vh] md:h-[90vh] lg:h-[100vh] bg-left"
                style={{
                  backgroundImage: "url('/photo/3.png')"
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 sm:py-32 lg:py-40 bg-white">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        
          * {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-md:px-4">
          <div className="relative rounded-2xl overflow-hidden shrink-0">
            <img className="max-w-md w-full object-cover rounded-2xl"
              src="/photo/siyahlogo.png"
              alt="B2 Sports Academy Logo" />
          </div>
          <div className="text-sm text-slate-600 max-w-lg">
            <h1 className="text-xl uppercase font-semibold text-slate-700">Hakkımızda</h1>
            <p className="mt-8">B2 Sport Academy, 2024 yılından bu yana MMA, Kickboks, Capoeira, Personal Training ve Functional Fitness alanlarında profesyonel eğitim sunan bir akademidir.</p>
            <p className="mt-4">Amacımız, her bireyin potansiyelini keşfetmesine, disiplin ve özgüven kazanmasına katkı sağlamaktır. Yaş, cinsiyet ve seviye fark etmeksizin herkes için uygun programlar sunuyoruz.</p>
            <p className="mt-4">Modern tesislerimiz ve deneyimli antrenörlerimizle sporcularımızın hedeflerine ulaşmalarına yardımcı oluyoruz.</p>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-20 sm:py-32 lg:py-40 bg-black">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">PROGRAM</h2>
          </div>
          
          {/* Mobile stacked view */}
          <div className="md:hidden space-y-4">
            {DAYS.map(day => {
              const daySchedule: { time: string; activity: string }[] = [];
              Object.keys(schedule).sort().forEach(time => {
                const activity = schedule[time]?.[day];
                if (activity && activity.trim()) {
                  daySchedule.push({ time, activity });
                }
              });
              
              if (daySchedule.length === 0) return null;
              
              return (
                <div key={day} className="border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{DAY_LABELS[day]}</span>
                  </div>
                  {daySchedule.map(({ time, activity }, idx) => (
                    <div key={idx} className="flex items-center justify-end mt-2">
                      <span className="text-gray-300">{time} {activity}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Desktop/tablet table view */}
          <div className="hidden md:block bg-black overflow-hidden" style={{border: '3px solid #1a1a1b'}}>
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-6 text-left font-semibold text-base" style={{color: '#afaeb2', border: '1px solid #1a1a1b'}}></th>
                    {DAYS.map(day => (
                      <th key={day} className="px-4 py-6 text-center font-semibold text-base" style={{color: '#afaeb2', border: '1px solid #1a1a1b'}}>
                        {DAY_LABELS[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(schedule).sort().map(time => (
                    <tr key={time}>
                      <td className="px-4 py-6 font-medium text-base" style={{color: '#afaeb2', border: '1px solid #1a1a1b'}}>
                        {time}
                      </td>
                      {DAYS.map(day => (
                        <td key={`${time}-${day}`} className="px-4 py-6 text-center text-base" style={{color: '#afaeb2', border: '1px solid #1a1a1b'}}>
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
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 sm:py-32 lg:py-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">GALERİ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.length > 0 ? (
              galleryImages.sort((a, b) => a.order - b.order).map((image) => (
                <div key={image.id} className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${image.path}')`
                    }}
                  ></div>
                </div>
              ))
            ) : (
              // Fallback to default images if no data
              <>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/1.jpg')"
                    }}
                  ></div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/2.jpg')"
                    }}
                  ></div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/3.webp')"
                    }}
                  ></div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/4.webp')"
                    }}
                  ></div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/5.webp')"
                    }}
                  ></div>
                </div>
                <div className="bg-black rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/photo/galeri/6.webp')"
                    }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-32 lg:py-40 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">SIKÇA SORULAN SORULAR</h2>
          </div>
          <div className="space-y-6">
            {(faqList.length > 0 ? faqList : [
              {
                id: 1,
                question: "MMA nedir?",
                answer: "Mixed Martial Arts (MMA), farklı dövüş sanatlarının birleştirildiği modern bir spor dalıdır. Kickboks, boks, güreş, jiu-jitsu gibi tekniklerin harmanlandığı bu spor, hem ayakta hem de yerde mücadele etmeyi içerir.",
                order: 1
              },
              {
                id: 2,
                question: "Diğer dövüş sporlarından farkı nedir?",
                answer: "MMA, tek bir dövüş sanatına odaklanmak yerine birden fazla teknik öğrenmenizi sağlar. Bu da hem fiziksel hem de mental olarak daha kapsamlı bir gelişim sunar.",
                order: 2
              },
              {
                id: 3,
                question: "Hiç spor geçmişim yok, başlayabilir miyim?",
                answer: "Hiç sorun değil! Akademimizde her seviyeden öğrenciye uygun programlar bulunmaktadır. Başlangıç seviyesindeki öğrenciler için özel temel eğitim programlarımız mevcuttur.",
                order: 3
              },
              {
                id: 4,
                question: "İlk Ders Ücretli midir?",
                answer: "Hayır, Deneme dersi için bizimle iletişime geçmeniz yeterli. Size uygun bir tarih belirleyip, gerekli ekipmanları temin ederek derse katılabilirsiniz.",
                order: 4
              },
              {
                id: 5,
                question: "Ekipman edinmem gerekiyor mu?",
                answer: "İlk dersler için temel ekipmanları akademimiz sağlamaktadır. Düzenli katılım için kendi ekipmanlarınızı edinmeniz önerilir.",
                order: 5
              },
              {
                id: 6,
                question: "Savunmaya yönelik midir?",
                answer: "Evet, MMA eğitimimiz kişisel savunma tekniklerini de içerir. Öncelikle spor ve disiplin odaklı bir yaklaşım benimseriz.",
                order: 6
              }
            ]).sort((a, b) => a.order - b.order).map((faq, index) => (
              <div key={faq.id} className="bg-black rounded-lg border border-gray-900 hover:border-white transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between transition-all duration-300 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="font-light text-xl mr-6" style={{color: '#cfced3'}}>+</span>
                    <span className="font-medium text-lg" style={{color: '#cfced3'}}>{faq.question}</span>
                  </div>
                </button>
                {activeFAQ === index && (
                  <div className="px-8 pb-6 ml-16">
                    <p className="text-gray-300 text-base leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 lg:py-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-8">ÜYELERİMİZİN YORUMLARI</h2>
          </div>
          <div className="relative">
            <div className="bg-gray-200 rounded-lg p-12 relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-black text-2xl font-bold">"</span>
              </div>
              <p className="text-black text-lg leading-relaxed mb-8">
                B2 Sport Academy'nin bir üyesi olarak spor salonundan çok memnunum. Antrenmanları çok seviyorum. Profesyonel sporcularla antrenman yaparak deneyim kazanıyoruz. Ayrıca antrenmanlarda deneyimiyle bize deneyim katan hocamız Burak'a da teşekkür ediyorum. Uzun süredir sadece izlemekle yetindiğim spora Burak hocamın bana aşıladığı özgüveni sayesinde başladım. Burdan bütün salona özellikle bize dost gibi yaklaşıp bize sporu sevdiren Burak hocama ve temizliğe gösterilen özene çok teşekkür ediyorum.
              </p>
              <span className="text-black font-semibold text-lg">Okan Can Demirtaş</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 sm:py-32 lg:py-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8">İLETİŞİM</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sol Taraf - İletişim Bilgileri */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">İletişim Bilgileri</h3>
              <div className="space-y-4">
                <a href={contactData.phoneLink} target="_blank" rel="noopener noreferrer" className="bg-black border border-gray-800 rounded-lg p-4 flex items-center space-x-4 hover:border-white transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span className="text-white text-lg font-light">{contactData.phone}</span>
                </a>
                <div className="bg-black border border-gray-800 rounded-lg p-4 flex items-center space-x-4 hover:border-white transition-all duration-300 cursor-pointer">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white text-lg font-light">{contactData.email}</span>
                </div>
                <a href={contactData.mapLink} target="_blank" rel="noopener noreferrer" className="bg-black border border-gray-800 rounded-lg p-4 flex items-center space-x-4 hover:border-white transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <span className="text-white text-lg font-light">{contactData.address}</span><br />
                    <span className="text-white text-lg font-light">{contactData.addressDetail}</span>
                  </div>
                </a>
                </div>
              
              {/* Sosyal Medya */}
              <div className="mt-8">
                <h4 className="text-white font-semibold mb-4">Sosyal Medya</h4>
                <div className="flex space-x-4">
                  {contactData.socialMedia.instagram && (
                    <a href={contactData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {contactData.socialMedia.facebook && (
                    <a href={contactData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sağ Taraf - Harita */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">Konum</h3>
              <div className="w-full h-96 rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  src={contactData.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ 
                    border: 'none',
                    outline: 'none',
                    borderRadius: '8px'
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="B2 Sport Academy Konum"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telif Hakkı */}
      <div className="bg-black py-4 text-center">
        <p style={{color: '#55565e'}}>&copy; B2 SPORTS ACADEMY 2025</p>
        </div>
    </div>
  );
}

