import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"appointments" | "reviews">("appointments");

  const { data: appointments, isLoading: appointmentsLoading } = trpc.appointments.list.useQuery();
  const { data: reviews, isLoading: reviewsLoading } = trpc.reviews.listAll.useQuery() as any;

  // Vérifier que l'utilisateur est admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Accès Refusé</h1>
          <p className="text-muted-foreground mb-6">Vous n'avez pas accès à cette page.</p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="bg-foreground text-background border-b-8 border-accent">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent"></div>
            <span className="font-bold text-xl">EL MOUSSAOUI - Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.name}</span>
            <Button variant="outline" onClick={handleLogout} className="text-foreground border-background hover:bg-background/20">
              Déconnexion
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Rendez-vous</p>
            <p className="text-3xl font-bold text-accent">{appointments?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Rendez-vous en attente</p>
            <p className="text-3xl font-bold text-yellow-600">
              {appointments?.filter((a: any) => a.status === "pending").length || 0}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Avis</p>
            <p className="text-3xl font-bold text-accent">{reviews?.length || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground text-sm mb-2">Avis en attente</p>
            <p className="text-3xl font-bold text-yellow-600">
              {reviews?.filter((r: any) => r.status === "pending").length || 0}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setSelectedTab("appointments")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              selectedTab === "appointments"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Rendez-vous ({appointments?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              selectedTab === "reviews"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Avis ({reviews?.length || 0})
          </button>
        </div>

        {/* Appointments Tab */}
        {selectedTab === "appointments" && (
          <div className="space-y-4">
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              appointments.map((appointment: any) => (
                <Card key={appointment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{appointment.name}</h3>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            appointment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status === "pending"
                            ? "En attente"
                            : appointment.status === "confirmed"
                            ? "Confirmé"
                            : "Complété"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        <strong>Email:</strong> {appointment.email}<br />
                        <strong>Téléphone:</strong> {appointment.phone}<br />
                        <strong>Véhicule:</strong> {appointment.vehicle}<br />
                        <strong>Service:</strong> {appointment.service}<br />
                        {appointment.message && (
                          <>
                            <strong>Message:</strong> {appointment.message}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(appointment.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                Aucun rendez-vous pour le moment
              </Card>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {selectedTab === "reviews" && (
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{review.title}</h3>
                        <div className="flex gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                          ))}
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            review.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : review.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {review.status === "pending"
                            ? "En attente"
                            : review.status === "approved"
                            ? "Approuvé"
                            : "Rejeté"}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{review.content}</p>
                      <p className="text-muted-foreground text-sm mb-3">
                        <strong>Par:</strong> {review.name} ({review.email})<br />
                        {review.service && (
                          <>
                            <strong>Service:</strong> {review.service}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(review.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-muted-foreground">
                Aucun avis pour le moment
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
