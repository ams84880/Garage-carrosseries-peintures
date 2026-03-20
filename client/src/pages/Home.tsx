import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GarageMap from "@/components/GarageMap";
import { Wrench, Palette, Shield, Clock, Phone, Mail, MapPin, ChevronRight, Star, Send } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle: "",
    service: "",
    message: "",
  });

  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    content: "",
    service: "",
  });

  const appointmentMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Demande de rendez-vous envoyée avec succès!");
      setAppointmentForm({ name: "", email: "", phone: "", vehicle: "", service: "", message: "" });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de la demande");
    },
  });

  const reviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avis envoyé avec succès! Il sera approuvé prochainement.");
      setReviewForm({ name: "", email: "", rating: 5, title: "", content: "", service: "" });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de l'avis");
    },
  });

  const { data: approvedReviews } = trpc.reviews.listApproved.useQuery();

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value === "rating" ? parseInt(value) : value }));
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    appointmentMutation.mutate(appointmentForm);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate(reviewForm);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b border-border z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent"></div>
            <span className="font-bold text-xl">EL MOUSSAOUI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="hover:text-accent transition-colors">Services</a>
            <a href="#gallery" className="hover:text-accent transition-colors">Galerie</a>
            <a href="#reviews" className="hover:text-accent transition-colors">Avis</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-orange-700">Devis</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 -z-10"></div>
        
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-accent"></div>
                <span className="text-accent font-semibold">EXCELLENCE AUTOMOBILE</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Carrosserie & Peinture Automobile à Avignon - El Moussaoui Auto Étoiles
              </h1>
              <p className="text-xl text-muted-foreground">
                Expertise professionnelle en carrosserie et peinture automobile depuis plus de 25 ans
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button className="bg-accent text-accent-foreground hover:bg-orange-700 px-8 py-6 text-lg">
                Demander un devis
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg border-foreground text-foreground hover:bg-foreground hover:text-background">
                En savoir plus
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8">
              <div>
                <p className="text-3xl font-bold text-accent">25+</p>
                <p className="text-muted-foreground">Années d'expérience</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-accent">1000+</p>
                <p className="text-muted-foreground">Véhicules restaurés</p>
              </div>
            </div>
          </div>

          <div className="relative h-96 md:h-full">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663363329674/Yi9YgyZVmnr38r2ruWZoJR/equipe-professionnelle-garage-cxJrj9GXsSeSGVHoFDkDyT.webp"
              alt="Equipe professionnelle de carrosserie et peinture automobile - Garage Avignon"
              className="w-full h-full object-cover border-4 border-accent"
            />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 border-2 border-accent"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-secondary/5 border-t-8 border-accent">
        <div className="container">
          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-accent"></div>
              <span className="text-accent font-semibold">NOS SERVICES</span>
            </div>
            <h2 className="section-title">Services Professionnels</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Nous offrons une gamme complète de services de carrosserie et peinture automobile avec les meilleures techniques et matériaux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Palette,
                title: "Peinture Automobile",
                description: "Peinture de haute qualité avec finition brillante ou mate, respects des normes écologiques."
              },
              {
                icon: Wrench,
                title: "Réparation Carrosserie",
                description: "Réparation des dégâts, débosselage, redressage et remplacement de pièces carrosserie."
              },
              {
                icon: Shield,
                title: "Protection & Vernis",
                description: "Application de vernis protecteur, céramique et traitement anti-UV pour longévité."
              },
              {
                icon: Clock,
                title: "Travail Rapide",
                description: "Délais courts sans compromettre la qualité, planification flexible selon vos besoins."
              },
              {
                icon: Star,
                title: "Finition Premium",
                description: "Finitions haut de gamme avec contrôle qualité rigoureux et garantie satisfaction."
              },
              {
                icon: Wrench,
                title: "Préparation Véhicule",
                description: "Préparation complète avant peinture, ponçage, apprêt et masquage professionnel."
              }
            ].map((service, idx) => (
              <Card key={idx} className="service-card group">
                <service.icon className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-background border-t-8 border-accent">
        <div className="container">
          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-accent"></div>
              <span className="text-accent font-semibold">PORTFOLIO</span>
            </div>
            <h2 className="section-title">Nos Réalisations</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez nos derniers projets de carrosserie et peinture automobile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663363329674/Yi9YgyZVmnr38r2ruWZoJR/reparation-carrosserie-avant-apres-RFEEHCfZawKSVLVupS7b3q.webp", title: "Avant/Après" },
              { img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663363329674/Yi9YgyZVmnr38r2ruWZoJR/voiture-finition-premium-HSDvxQniXPJVyMgddModRM.webp", title: "Finition Premium" },
              { img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663363329674/Yi9YgyZVmnr38r2ruWZoJR/garage-atelier-professionnel-FXu8vHRS8g8QPnGKUS2Uqe.webp", title: "Atelier Professionnel" }
            ].map((item, idx) => (
              <div key={idx} className="gallery-item h-64">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-secondary/5 border-t-8 border-accent">
        <div className="container">
          <div className="space-y-4 mb-16">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-accent"></div>
              <span className="text-accent font-semibold">TÉMOIGNAGES</span>
            </div>
            <h2 className="section-title">Avis Clients</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Découvrez ce que nos clients pensent de nos services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {approvedReviews && approvedReviews.length > 0 ? (
              approvedReviews.map((review) => (
                <Card key={review.id} className="service-card">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{review.title}</h3>
                  <p className="text-muted-foreground mb-4">{review.content}</p>
                  <p className="text-sm font-semibold">{review.name}</p>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full">Aucun avis approuvé pour le moment.</p>
            )}
          </div>

          {/* Add Review Form */}
          <div className="bg-card border border-border p-8 rounded-sm">
            <h3 className="text-2xl font-bold mb-6">Laisser un Avis</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom *</label>
                  <Input 
                    type="text" 
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewChange}
                    placeholder="Votre nom"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <Input 
                    type="email" 
                    name="email"
                    value={reviewForm.email}
                    onChange={handleReviewChange}
                    placeholder="votre@email.com"
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Note *</label>
                  <select 
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    className="w-full px-3 py-2 border border-border bg-background rounded-sm"
                  >
                    <option value="5">5 étoiles - Excellent</option>
                    <option value="4">4 étoiles - Très bon</option>
                    <option value="3">3 étoiles - Bon</option>
                    <option value="2">2 étoiles - Acceptable</option>
                    <option value="1">1 étoile - Mauvais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Service</label>
                  <select 
                    name="service"
                    value={reviewForm.service}
                    onChange={handleReviewChange}
                    className="w-full px-3 py-2 border border-border bg-background rounded-sm"
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="painting">Peinture</option>
                    <option value="bodywork">Réparation carrosserie</option>
                    <option value="protection">Protection & Vernis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Titre *</label>
                <Input 
                  type="text" 
                  name="title"
                  value={reviewForm.title}
                  onChange={handleReviewChange}
                  placeholder="Titre de votre avis"
                  required
                  className="bg-background border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Votre avis *</label>
                <Textarea 
                  name="content"
                  value={reviewForm.content}
                  onChange={handleReviewChange}
                  placeholder="Partagez votre expérience..."
                  required
                  className="bg-background border-border min-h-24"
                />
              </div>

              <Button 
                type="submit"
                disabled={reviewMutation.isPending}
                className="w-full bg-accent text-accent-foreground hover:bg-orange-700 py-6 text-lg font-semibold"
              >
                {reviewMutation.isPending ? "Envoi..." : "Envoyer mon avis"}
                <Send className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact & Quote Section */}
      <section id="contact" className="py-20 bg-background border-t-8 border-accent">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-accent"></div>
                  <span className="text-accent font-semibold">CONTACT</span>
                </div>
                <h2 className="section-title">Nous Contacter</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <p className="text-muted-foreground">06 13 87 31 31</p>
                    <p className="text-muted-foreground">07 45 56 45 81</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">AMS84@OUTLOOK.FR</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-muted-foreground">3250 & 3260 Av de l'Amandier<br />84000 Avignon, France</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/10 border border-border p-6">
                <p className="font-semibold mb-2">Horaires d'ouverture</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>Lundi - Vendredi: 08:00 - 18:00</p>
                  <p>Samedi: 09:00 - 13:00</p>
                  <p>Dimanche: Fermé</p>
                </div>
              </div>
            </div>

            {/* Quote Form */}
            <div className="bg-card border border-border p-8">
              <h3 className="text-2xl font-bold mb-6">Demander un Devis</h3>
              
              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom complet *</label>
                  <Input 
                    type="text" 
                    name="name"
                    value={appointmentForm.name}
                    onChange={handleAppointmentChange}
                    placeholder="Jean Dupont"
                    required
                    className="bg-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <Input 
                      type="email" 
                      name="email"
                      value={appointmentForm.email}
                      onChange={handleAppointmentChange}
                      placeholder="jean@example.com"
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Téléphone</label>
                    <Input 
                      type="tel" 
                      name="phone"
                      value={appointmentForm.phone}
                      onChange={handleAppointmentChange}
                      placeholder="+33 6 12 34 56 78"
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Véhicule</label>
                  <Input 
                    type="text" 
                    name="vehicle"
                    value={appointmentForm.vehicle}
                    onChange={handleAppointmentChange}
                    placeholder="Marque et modèle"
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Service demandé</label>
                  <select 
                    name="service"
                    value={appointmentForm.service}
                    onChange={handleAppointmentChange}
                    className="w-full px-3 py-2 border border-border bg-background rounded-sm"
                  >
                    <option value="">Sélectionner un service</option>
                    <option value="painting">Peinture</option>
                    <option value="bodywork">Réparation carrosserie</option>
                    <option value="protection">Protection & Vernis</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message</label>
                  <Textarea 
                    name="message"
                    value={appointmentForm.message}
                    onChange={handleAppointmentChange}
                    placeholder="Décrivez votre projet..."
                    className="bg-background border-border min-h-24"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={appointmentMutation.isPending}
                  className="w-full bg-accent text-accent-foreground hover:bg-orange-700 py-6 text-lg font-semibold"
                >
                  {appointmentMutation.isPending ? "Envoi..." : "Envoyer ma demande"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-secondary/5 border-t-8 border-accent">
        <div className="container">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-accent"></div>
              <span className="text-accent font-semibold">LOCALISATION</span>
            </div>
            <h2 className="section-title">Trouvez-nous</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Visitez notre atelier à Avignon. Cliquez sur le marqueur pour plus d'informations.
            </p>
          </div>

          <div className="w-full h-96 border-4 border-accent rounded-sm overflow-hidden shadow-lg">
            <GarageMap 
              address="3250 Avenue de l'Amandier, 84000 Avignon, France"
              lat={43.9352}
              lng={4.8084}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 border-t-8 border-accent">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-accent"></div>
                <span className="font-bold">EL MOUSSAOUI</span>
              </div>
              <p className="text-background/80">Excellence en carrosserie et peinture automobile depuis 1999.</p>
            </div>

            <div>
              <p className="font-semibold mb-4">Services</p>
              <ul className="space-y-2 text-background/80">
                <li><a href="#services" className="hover:text-accent transition-colors">Peinture</a></li>
                <li><a href="#services" className="hover:text-accent transition-colors">Carrosserie</a></li>
                <li><a href="#services" className="hover:text-accent transition-colors">Protection</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-4">Entreprise</p>
              <ul className="space-y-2 text-background/80">
                <li><a href="#gallery" className="hover:text-accent transition-colors">Portfolio</a></li>
                <li><a href="#reviews" className="hover:text-accent transition-colors">Avis</a></li>
                <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-4">Contact</p>
              <p className="text-background/80">06 13 87 31 31</p>
              <p className="text-background/80">AMS84@OUTLOOK.FR</p>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-background/60">&copy; 2026 El Moussaoui Auto Étoiles. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0 text-background/60">
              <a href="#" className="hover:text-accent transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-accent transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
