import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Instagram } from "lucide-react";
import BookingForm from "@/components/booking-form";
import { useState } from "react";

export default function Home() {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["/api/blocks"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews"],
  });

  const aboutBlock = blocks.find(b => b.blockType === 'about');
  const servicesBlock = blocks.find(b => b.blockType === 'services');
  const reviewsBlock = blocks.find(b => b.blockType === 'reviews');
  const contactsBlock = blocks.find(b => b.blockType === 'contacts');

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-pastel rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">
                  {settings.masterName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'АП'}
                </span>
              </div>
              <span className="text-xl font-semibold text-foreground">{settings.masterName}</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {aboutBlock && <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Обо мне</a>}
              {servicesBlock && <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Услуги</a>}
              {reviewsBlock && reviews.length > 0 && <a href="#reviews" className="text-muted-foreground hover:text-foreground transition-colors">Отзывы</a>}
              {contactsBlock && <a href="#contacts" className="text-muted-foreground hover:text-foreground transition-colors">Контакты</a>}
            </div>
            <Button 
              onClick={() => setShowBookingForm(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium rounded-full px-6"
            >
              Записаться
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-white to-secondary/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light text-foreground leading-tight">
                  {settings.masterName}
                </h1>
                <p className="text-xl text-muted-foreground font-light">
                  {settings.masterSignature}
                </p>
                <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                  {settings.masterDescription}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  onClick={() => setShowBookingForm(true)}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 rounded-full font-medium"
                >
                  Записаться на маникюр
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="border-border text-foreground px-8 py-3 rounded-full font-medium hover:bg-muted"
                >
                  <a href={`tel:${settings.masterPhone}`}>{settings.masterPhone}</a>
                </Button>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-6 pt-4">
                {settings.telegramEnabled && settings.telegramUsername && (
                  <a 
                    href={`https://t.me/${settings.telegramUsername}`} 
                    className="text-muted-foreground hover:text-blue-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </a>
                )}
                {settings.whatsappEnabled && settings.whatsappPhone && (
                  <a 
                    href={`https://wa.me/${settings.whatsappPhone.replace(/\D/g, '')}`} 
                    className="text-muted-foreground hover:text-green-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="w-6 h-6" />
                  </a>
                )}
                {settings.instagramEnabled && settings.instagramUsername && (
                  <a 
                    href={`https://instagram.com/${settings.instagramUsername}`} 
                    className="text-muted-foreground hover:text-pink-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <img 
                src={settings.masterPhoto || "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"} 
                alt={`Мастер маникюра ${settings.masterName}`}
                className="rounded-3xl shadow-soft w-full max-w-md mx-auto object-cover h-96"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-gentle">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">5+</div>
                  <div className="text-sm text-muted-foreground">лет опыта</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {aboutBlock && (
        <section id="about" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-slide-up">
                <h2 className="text-3xl md:text-4xl font-light text-foreground">
                  {aboutBlock.title}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {aboutBlock.content?.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">500+</div>
                    <div className="text-sm text-muted-foreground">довольных клиентов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-foreground">5</div>
                    <div className="text-sm text-muted-foreground">лет опыта</div>
                  </div>
                </div>
              </div>
              
              <div className="relative animate-scale-in">
                <img 
                  src={aboutBlock.image || "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                  alt="Рабочее место мастера маникюра"
                  className="rounded-3xl shadow-soft w-full object-cover h-80"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {servicesBlock && services.length > 0 && (
        <section id="services" className="py-20 bg-gradient-soft">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                {servicesBlock.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {servicesBlock.content}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card 
                  key={service.id} 
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-gentle transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-gradient-pastel rounded-xl flex items-center justify-center mb-6">
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{service.name}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="text-2xl font-semibold text-accent-foreground">{service.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviewsBlock && reviews.length > 0 && (
        <section id="reviews" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                {reviewsBlock.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {reviewsBlock.content}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.slice(0, 6).map((review, index) => (
                <Card 
                  key={review.id} 
                  className="bg-secondary/50 rounded-2xl p-8 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center mb-6">
                      <img 
                        src={review.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=f0f0f0&color=666`}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{review.name}</div>
                        <div className="text-sm text-muted-foreground">Клиентка</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      "{review.text}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contacts Section */}
      {contactsBlock && (
        <section id="contacts" className="py-20 bg-gradient-pastel">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
                {contactsBlock.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {contactsBlock.content}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8 animate-slide-up">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-6">Способы связи</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-pastel rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Телефон</div>
                        <div className="text-muted-foreground">{settings.masterPhone}</div>
                      </div>
                    </div>

                    {settings.telegramEnabled && settings.telegramUsername && (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-pastel rounded-xl flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Telegram</div>
                          <div className="text-muted-foreground">@{settings.telegramUsername}</div>
                        </div>
                      </div>
                    )}

                    {settings.whatsappEnabled && settings.whatsappPhone && (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-pastel rounded-xl flex items-center justify-center">
                          <Phone className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">WhatsApp</div>
                          <div className="text-muted-foreground">{settings.whatsappPhone}</div>
                        </div>
                      </div>
                    )}

                    {settings.instagramEnabled && settings.instagramUsername && (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-pastel rounded-xl flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-pink-500" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Instagram</div>
                          <div className="text-muted-foreground">@{settings.instagramUsername}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Время работы</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Понедельник - Пятница:</span>
                      <span>9:00 - 19:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Суббота:</span>
                      <span>10:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Воскресенье:</span>
                      <span>Выходной</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 rounded-3xl p-8 animate-scale-in">
                <h3 className="text-xl font-semibold text-foreground mb-6">Быстрая запись</h3>
                <Button 
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 py-4 rounded-xl font-medium"
                >
                  Оставить заявку
                </Button>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Отвечу в течение 30 минут в рабочее время
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-pastel rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {settings.masterName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'АП'}
                </span>
              </div>
              <span className="text-muted-foreground">{settings.masterName} • Мастер маникюра</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 Все права защищены
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Form Modal */}
      <BookingForm 
        isOpen={showBookingForm} 
        onClose={() => setShowBookingForm(false)} 
        services={services}
      />
    </div>
  );
}
