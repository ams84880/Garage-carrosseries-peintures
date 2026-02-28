import { useEffect, useRef } from 'react';

/**
 * GarageMap Component - Affiche la localisation du garage sur Google Maps
 * Utilise le proxy Manus pour l'authentification automatique
 */

interface GarageMapProps {
  address?: string;
  lat?: number;
  lng?: number;
}

export default function GarageMap({ 
  address = "3250 Avenue de l'Amandier, 84000 Avignon, France",
  lat = 43.9352,
  lng = 4.8084
}: GarageMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialiser la carte
    map.current = new google.maps.Map(mapContainer.current, {
      zoom: 15,
      center: { lat, lng },
      styles: [
        {
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          elementType: "labels.text.stroke",
          stylers: [{ color: "#f5f5f5" }],
        },
        {
          featureType: "administrative.land_parcel",
          elementType: "labels.text.fill",
          stylers: [{ color: "#bdbdbd" }],
        },
        {
          featureType: "poi",
          elementType: "geometry",
          stylers: [{ color: "#eeeeee" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#dadada" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          featureType: "road.local",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
        {
          featureType: "transit.line",
          elementType: "geometry",
          stylers: [{ color: "#e5e5e5" }],
        },
        {
          featureType: "transit.station",
          elementType: "geometry",
          stylers: [{ color: "#eeeeee" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#c9c9c9" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
      ],
    });

    // Ajouter un marqueur
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map.current,
      title: "El Moussaoui Auto Étoiles",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#E67E22",
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    // Ajouter une infowindow
    const infowindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #0F0F0F; font-size: 16px; font-weight: bold;">El Moussaoui Auto Étoiles</h3>
          <p style="margin: 4px 0; color: #6B6B6B; font-size: 13px;">
            <strong>Adresse:</strong><br/>
            3250 & 3260 Av de l'Amandier<br/>
            84000 Avignon, France
          </p>
          <p style="margin: 4px 0; color: #6B6B6B; font-size: 13px;">
            <strong>Téléphone:</strong><br/>
            06 13 87 31 31<br/>
            07 45 56 45 81
          </p>
          <p style="margin: 4px 0; color: #6B6B6B; font-size: 13px;">
            <strong>Email:</strong><br/>
            AMS84@OUTLOOK.FR
          </p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infowindow.open(map.current, marker);
    });

    // Ouvrir l'infowindow au chargement
    infowindow.open(map.current, marker);

  }, [lat, lng]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        borderRadius: '0.25rem'
      }} 
    />
  );
}
