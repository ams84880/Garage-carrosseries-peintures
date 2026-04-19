# Supabase Integration Guide

Ce guide explique comment intégrer Supabase au site El Moussaoui Auto Étoiles.

## 📋 Prérequis

- Node.js 18+
- pnpm ou npm
- Compte Supabase (gratuit sur https://supabase.com)

## 🚀 Installation Rapide

### 1. Créer un compte Supabase

1. Allez sur https://supabase.com
2. Créez un compte avec AMS84@OUTLOOK.FR
3. Créez un nouveau projet
4. Notez l'URL et les clés API

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Initialiser la base de données

```bash
# Installer les dépendances
pnpm install

# Initialiser le schéma de base de données
node init-supabase-db.mjs
```

## 📊 Architecture de la Base de Données

### Table: `appointments`

Stocke les demandes de rendez-vous des clients.

```sql
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  vehicle VARCHAR(255),
  service VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Statuts possibles:**
- `pending` - En attente de confirmation
- `confirmed` - Confirmé
- `completed` - Complété
- `cancelled` - Annulé

### Table: `reviews`

Stocke les avis clients.

```sql
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Statuts possibles:**
- `pending` - En attente de modération
- `approved` - Approuvé et visible
- `rejected` - Rejeté

## 💻 Utilisation dans le Code

### Hooks React

```typescript
import { useAppointments, useReviews } from '@/hooks/useSupabase';

// Dans un composant
export function MyComponent() {
  const { appointments, createAppointment, loading } = useAppointments();
  const { reviews, createReview } = useReviews();

  const handleCreateAppointment = async () => {
    await createAppointment({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0613873131',
      vehicle: 'Renault Clio',
      service: 'Peinture',
      message: 'Je voudrais un devis',
    });
  };

  return (
    // Votre UI
  );
}
```

### API Directe

```typescript
import { appointmentsAPI, reviewsAPI } from '@/lib/supabase';

// Créer un rendez-vous
const appointment = await appointmentsAPI.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '0613873131',
  vehicle: 'Renault Clio',
  service: 'Peinture',
});

// Récupérer tous les rendez-vous
const allAppointments = await appointmentsAPI.getAll();

// Mettre à jour le statut
await appointmentsAPI.update(1, { status: 'confirmed' });

// Créer un avis
const review = await reviewsAPI.create({
  name: 'John Doe',
  email: 'john@example.com',
  rating: 5,
  comment: 'Excellent service!',
});

// Récupérer les avis approuvés
const approvedReviews = await reviewsAPI.getApproved();

// Approuver un avis
await reviewsAPI.updateStatus(1, 'approved');
```

## 🔐 Sécurité

### Row Level Security (RLS)

Les politiques RLS sont automatiquement configurées :

- **Appointments**: Insertion publique, lecture publique, modification/suppression admin
- **Reviews**: Insertion publique, lecture des avis approuvés, modification/suppression admin

### Authentification

Pour les opérations admin (modification, suppression), utilisez la clé de service :

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## 📡 Real-time Subscriptions

Écoutez les changements en temps réel :

```typescript
import { subscribeToAppointments, subscribeToReviews } from '@/lib/supabase';

// Écouter les nouveaux rendez-vous
const subscription = subscribeToAppointments((appointments) => {
  console.log('Appointments updated:', appointments);
});

// Se désabonner
subscription.unsubscribe();
```

## 🖼️ Stockage de Fichiers

Supabase Storage permet de stocker des images :

```typescript
import { supabase } from '@/lib/supabase';

// Uploader une image
const { data, error } = await supabase.storage
  .from('garage-images')
  .upload('before-after/car-1.jpg', file);

if (error) {
  console.error('Upload failed:', error);
} else {
  const publicUrl = supabase.storage
    .from('garage-images')
    .getPublicUrl(data.path).data.publicUrl;
  console.log('Image URL:', publicUrl);
}
```

## 🔧 Scripts Disponibles

```bash
# Initialiser Supabase
node setup-supabase.mjs

# Initialiser la base de données
node init-supabase-db.mjs

# Démarrer le serveur de développement
pnpm dev

# Construire pour la production
pnpm build
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## ❓ Dépannage

### Erreur: "Supabase credentials not configured"

Assurez-vous que les variables d'environnement sont définies dans `.env.local` :

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Erreur: "Permission denied"

Vérifiez que les politiques RLS sont correctement configurées dans le dashboard Supabase.

### Erreur: "Table does not exist"

Exécutez le script d'initialisation :

```bash
node init-supabase-db.mjs
```

## 📞 Support

Pour toute question ou problème, consultez :
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
