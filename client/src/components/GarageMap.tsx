import { useRef } from 'react';
import { MapView } from './Map';

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Ajouter un marqueur avec l'API AdvancedMarkerElement
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat, lng },
      title: "El Moussaoui Auto Étoiles",
    });

    // Créer l'infowindow
    infoWindowRef.current = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 280px;">
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

    // Ouvrir l'infowindow au chargement
    if (mapRef.current && infoWindowRef.current) {
      infoWindowRef.current.open({
        anchor: marker,
        map,
      });
    }

    // Ajouter un écouteur de clic sur le marqueur
    marker.addListener("click", () => {
      if (mapRef.current && infoWindowRef.current) {
        infoWindowRef.current.open({
          anchor: marker,
          map: mapRef.current,
        });
      }
    });
  };

  return (
    <MapView
      initialCenter={{ lat, lng }}
      initialZoom={15}
      onMapReady={handleMapReady}
      className="w-full h-96"
    />
  );
}
