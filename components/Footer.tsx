import { BookOpen, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
    <div>
       {/* Footer */}
            <footer id="contact" className="bg-slate-900 text-white py-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">السيد الابي</h3>
                        <p className="text-xs text-slate-400">لتعليم اللغة العربية</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-4 text-sm">
                      متخصص في تدريس اللغة العربية للمرحلة الثانوية وفق المنهج المصري
                    </p>
                    <div className="flex items-center text-slate-400 text-sm mb-2">
                      <MapPin className="w-4 h-4 ml-2" />
                      <span>طنطا مصر</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-3 text-sm">روابط سريعة</h4>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#courses" className="text-slate-400 hover:text-white transition-colors">المستويات الدراسية</a></li>
                      <li><a href="#methodology" className="text-slate-400 hover:text-white transition-colors">طريقة التدريس</a></li>
                      <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">من نحن</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-3 text-sm">التواصل</h4>
                    <ul className="space-y-3 text-slate-400 text-sm">
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>01224641106</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>info@alsayed.com</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>واتساب: 0123456789</span>
                        
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-slate-800 pt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    © 2025 منصة الأستاذ السيد الابي. جميع الحقوق محفوظة.
                  </p>
                </div>
              </div>
            </footer>
    
    </div>
  )
}

 {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">السيد الابي</h3>
                  <p className="text-xs text-slate-400">لتعليم اللغة العربية</p>
                </div>
              </div>
              <p className="text-slate-400 mb-4 text-sm">
                متخصص في تدريس اللغة العربية للمرحلة الثانوية وفق المنهج المصري
              </p>
              <div className="flex items-center text-slate-400 text-sm mb-2">
                <MapPin className="w-4 h-4 ml-2" />
                <span>القاهرة، مصر</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-sm">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#courses" className="text-slate-400 hover:text-white transition-colors">المستويات الدراسية</a></li>
                <li><a href="#methodology" className="text-slate-400 hover:text-white transition-colors">طريقة التدريس</a></li>
                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">من نحن</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-sm">التواصل</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>0123456789</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@alsayed.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب: 0123456789</span>
                  
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 منصة الأستاذ السيد الابي. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
export default Footer
