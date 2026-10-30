# Meudon, stars du dimanche ⚽

> **⚠️ AVERTISSEMENT CRITIQUE / DISCLAIMER IMPORTANT ⚠️**  
> **Ce projet a été ENTIÈREMENT "VIBECODÉ" (100% généré par assistance IA / LLM) et son code N'A PAS ÉTÉ VÉRIFIÉ, AUDITÉ NI VALIDÉ par un développeur ou une équipe d'ingénierie logicielle.**  
>  
> - **Aucun audit de sécurité** : Les flux de données, les règles d'accès et la gestion du code PIN n'ont pas fait l'objet d'un audit de sécurité formel.  
> - **Absence de passerelle bancaire automatisée** : Les paiements et remboursements reposent sur des liens de redirection déclaratifs (PayPal.me, Revolut.me, espèces) et non sur des webhooks bancaires cryptographiques (pas de Stripe Connect, pas d'API PayPal SDK serveur). La réconciliation financière reste manuelle sous la responsabilité des joueurs et de l'organisateur.  
> - **Sécurité d'accès** : L'accès aux paramètres organisateur est protégé par un code PIN vérifié côté client. Ne stockez jamais d'informations confidentielles ou bancaires sensibles (pas de numéros de carte de crédit ni de coordonnées bancaires directes).  
> - **Usage recommandé** : Cette application est destinée à un usage récréatif et amical pour organiser des parties de football entre amis. Si vous souhaitez l'utiliser pour des tournois officiels ou des transactions commerciales, vous devez impérativement refactoriser et faire auditer le code.

---

## Table des Matières

1. [Vue d'ensemble du Projet](#1-vue-densemble-du-projet)
2. [Fonctionnalités : Ce que l'application peut faire](#2-fonctionnalités--ce-que-lapplication-peut-faire)
   - [Gestion de l'Effectif & Règle des 10 Titulaires](#gestion-de-leffectif--règle-des-10-titulaires)
   - [Terrain Tactique Interactif 5v5](#terrain-tactique-interactif-5v5)
   - [Système d'Inscription & Paiement](#système-dinscription--paiement)
   - [Désistement & File de Remboursement Automatisée](#désistement--file-de-remboursement-automatisée)
   - [Intégration WhatsApp Intelligente](#intégration-whatsapp-intelligente)
   - [Console Organisateur Dédiée (Code PIN)](#console-organisateur-dédiée-code-pin)
3. [Architecture Technique : Comment l'application le fait](#3-architecture-technique--comment-lapplication-le-fait)
   - [Stack Technologique](#stack-technologique)
   - [Schéma de Données Firebase Firestore](#schéma-de-données-firebase-firestore)
   - [Synchronisation Temps Réel & Hors Ligne](#synchronisation-temps-réel--hors-ligne)
   - [Mécanique d'Intégration WhatsApp (Presse-Papier + Deep Linking)](#mécanique-dintégration-whatsapp)
   - [Algorithmes d'Équilibrage & Gestion des Équipes](#algorithmes-déquilibrage--gestion-des-équipes)
4. [Règles de Sécurité Firestore](#4-règles-de-sécurité-firestore)
5. [Installation et Démarrage Local](#5-installation-et-démarrage-local)
6. [Guide de Déploiement](#6-guide-de-déploiement)

---

## 1. Vue d'ensemble du Projet

**Meudon, stars du dimanche** est une application web progressive (PWA) conçue pour éradiquer le désordre des conversations de groupe lors de l'organisation des matchs hebdomadaires de foot à 5 (Five) au complexe Marcel Bec à Meudon.

L'application résout les quatre problèmes majeurs de l'organisation sportive amateur :
1. **Le compte des joueurs** : Un match de Five requiert exactement 10 joueurs titulaires (5 contre 5). L'application verrouille automatiquement l'effectif dès que le 10ᵉ joueur s'inscrit et bascule immédiatement tous les inscrits suivants en **liste d'attente prioritaire gratuite**.
2. **La gestion de la trésorerie** : Les joueurs peuvent régler leur quote-part en 1 clic via PayPal ou Revolut (ou déclarer un paiement en espèces si l'organisateur l'autorise).
3. **Les désistements de dernière minute & les remboursements** : Si un joueur titulaire ayant déjà payé annule sa présence, le système enregistre une demande de remboursement avec son identifiant PayPal ou son Revtag, prépare une alerte WhatsApp pour le groupe afin de pourvoir la place vacante, et ajoute la requête à la file d'attente de l'organisateur.
4. **La répartition équilibrée des équipes** : Un terrain tactique interactif permet de visualiser les deux équipes (Équipe A avec Chasubles vs Équipe B Sans Chasubles), de changer un joueur d'équipe par simple clic, ou de lancer un tirage au sort automatique équilibré.

---

## 2. Fonctionnalités : Ce que l'application peut faire

### Gestion de l'Effectif & Règle des 10 Titulaires
- **Places 1 à 10 (Titulaires)** : Les 10 premiers inscrits sont affectés sur le terrain comme titulaires et sont invités à régler leur part.
- **Liste d'attente automatique** : Dès que l'effectif atteint 10 personnes, le bouton d'inscription indique clairement que la session est complète et propose de rejoindre la liste d'attente.
- **Gratuité pour la liste d'attente** : Les joueurs en liste d'attente ne paient rien (`0 €`) tant qu'une place titulaire ne leur est pas attribuée.
- **Promotion d'un remplaçant** : L'organisateur peut promouvoir un joueur de la liste d'attente en titulaire d'un simple clic.

### Terrain Tactique Interactif 5v5
- **Visualisation réaliste d'un terrain de Five** : Pelouse texturée avec marquages officiels, cages et rond central.
- **Affichage dynamique sans limite** : Bien que le match standard soit un 5v5, le composant supporte dynamiquement l'affichage de plus de 5 joueurs par équipe si des remplaçants ou invités y sont ajoutés.
- **Distinction visuelle des équipes** :
  - **Équipe A** : Maillot vert émeraude / Chasubles.
  - **Équipe B** : Maillot bleu nuit / Sans chasubles.
- **Changement d'équipe en 1 clic** : En cliquant sur le badge d'un joueur sur le terrain ou dans le tableau de bord, l'utilisateur peut basculer le joueur de l'Équipe A à l'Équipe B.
- **Badges de statut financier** : Chaque joueur arbore une pastille indiquant s'il a payé (`Payé`), s'il est en attente (`En attente`), ou son mode de paiement (PayPal, Revolut, Espèces).

### Système d'Inscription & Paiement
- **Formulaire d'inscription instantané** : Saisie du prénom / nom.
- **Sélection du mode de règlement** :
  - **PayPal** : Lien direct vers le compte `paypal.me` de l'organisateur avec montant pré-rempli.
  - **Revolut** : Redirection vers le profil `revolut.me` de l'organisateur.
  - **Espèces sur place** : Optionnel, activable/désactivable par l'organisateur dans les paramètres du match.
- **Affichage transparent du prix** : Montant unitaire par joueur (ex: 12 €) configurable par l'organisateur.

### Désistement & File de Remboursement Automatisée
- **Procédure d'annulation pour le joueur** : Tout joueur peut se désinscrire en cliquant sur l'icône de désistement en face de son nom.
- **Cas 1 : Joueur n'ayant pas payé ou ayant choisi l'espèce** : La désinscription est immédiate, sa place est libérée.
- **Cas 2 : Joueur ayant confirmé son paiement PayPal ou Revolut** :
  1. Une boîte de dialogue s'ouvre demandant au joueur ses coordonnées de remboursement (adresse email PayPal ou tag `@Revtag`).
  2. Une demande formelle de remboursement (`RefundRequest`) est créée dans la sous-collection Firestore `/games/{gameId}/refunds`.
  3. L'application prépare un message WhatsApp pré-formaté à envoyer directement à l'organisateur avec le récapitulatif complet de la somme due et l'identifiant de remboursement.
  4. La demande apparaît dans l'onglet **Remboursements** du panneau Organisateur.
  5. Une fois le virement émis manuellement par l'organisateur, ce dernier clique sur **« Marquer comme remboursé »**, horodatant la transaction et archivant la demande.

### Intégration WhatsApp Intelligente
- **Prise en charge du lien de groupe WhatsApp (`whatsappGroupUrl`)** :
  - Si l'organisateur a renseigné le lien de son groupe WhatsApp (ex: `https://chat.whatsapp.com/...`), l'application copie automatiquement le texte formaté dans le presse-papier du téléphone ou de l'ordinateur, puis **ouvre directement la conversation du groupe WhatsApp**, évitant de se perdre dans la liste des discussions.
  - Si aucun lien de groupe n'est configuré, l'application ouvre l'interface de partage standard WhatsApp (`api.whatsapp.com/send?text=...`) permettant de sélectionner n'importe quel contact ou groupe.
- **Déclencheurs de diffusion WhatsApp** :
  - **Alerte désistement / Place libérée** : Dès qu'un titulaire annule, un message d'alerte mentionnant le 1er de la liste d'attente est généré automatiquement.
  - **Invitation officielle au match** : Synthèse complète avec date, horaire, complexe (Five Meudon - Complexe Marcel Bec), numéro de terrain (ex: Terrain 3), tarif et lien web.
  - **Confirmation de remboursement** : Notification prête à l'envoi pour prévenir le joueur que ses fonds lui ont été restitués.

### Console Organisateur Dédiée (Code PIN)
- **Accès sécurisé par PIN** : Protégé par défaut par le code PIN `2026` (personnalisable).
- **Navigation par onglets réorganisée** :
  1. **Paramètres du match** (Premier onglet actif par défaut) :
     - Modification de la date et des horaires (début et fin).
     - Nom du complexe et numéro spécifique du terrain (ex: *Terrain 3*).
     - Lien Google Maps vers le terrain.
     - Montant par joueur en euros.
     - Liens de paiement (PayPal.me et Revolut.me de l'organisateur).
     - Autorisation ou interdiction du paiement en espèces sur le terrain.
     - Lien d'invitation au groupe WhatsApp.
     - Modification du code PIN organisateur.
     - Bouton **« Rééquilibrer les équipes »** (mélange aléatoire 5v5).
     - Bouton **« Préparer le dimanche suivant »** : Réinitialise les effectifs de joueurs et les demandes de remboursement en 1 clic et avance la date au dimanche suivant.
  2. **Remboursements** (Deuxième onglet avec badge de notification animé) :
     - File d'attente en temps réel des remboursements en attente.
     - Montant, nom du joueur et mode demandé (PayPal / Revolut).
     - Bouton de copie rapide de l'identifiant dans le presse-papier.
     - Bouton d'action directe WhatsApp vers le joueur.
     - Validation de fin de remboursement.

---

## 3. Architecture Technique : Comment l'application le fait

### Stack Technologique
- **Frontend** : React 19, TypeScript, Vite.
- **Styling** : Tailwind CSS v4 (`@import "tailwindcss";`), icônes vectorielles Lucide React.
- **Base de Données Temps Réel** : Google Firebase Cloud Firestore (Web SDK v11).
- **Gestionnaire de Paquets** : NPM / Bun.
- **Routage & Serveur** : Vite SPA + Express (`server.ts`) pour la prévisualisation et le déploiement full-stack.

### Schéma de Données Firebase Firestore

L'architecture s'appuie sur une structure de collections et sous-collections optimisée pour le plan gratuit Firebase Spark (50 000 lectures/jour) :

```
/games/{gameId}                          <-- Document du match actif
    ├── /players/{playerId}              <-- Sous-collection des joueurs inscrits
    └── /refunds/{refundId}              <-- Sous-collection des demandes de remboursement
```

#### 1. Document `/games/{gameId}`
Identifiant par défaut : `meudon-sunday-next`
```typescript
interface Game {
  id: string;               // "meudon-sunday-next"
  title: string;            // "Meudon, stars du dimanche"
  date: string;             // Format YYYY-MM-DD (ex: "2026-11-01")
  startTime: string;        // "10:00"
  endTime: string;          // "11:30"
  field: string;            // "Five Meudon - Complexe Marcel Bec, Route du Pavillon..."
  terrain: string;          // "Terrain 3"
  fieldMapUrl?: string;     // URL Google Maps
  pricePerPlayer: number;   // 12
  currency: string;         // "€"
  paypalLink?: string;      // "https://paypal.me/starsdudimanche"
  revolutLink?: string;     // "https://revolut.me/starsdudimanche"
  allowCash: boolean;       // true / false
  organizerPin: string;     // "2026"
  whatsappGroupUrl?: string;// "https://chat.whatsapp.com/..."
  status: 'open' | 'closed' | 'completed';
  createdAt: string;        // ISO Date String
  updatedAt: string;        // ISO Date String
}
```

#### 2. Sous-collection `/games/{gameId}/players/{playerId}`
```typescript
interface Player {
  id: string;               // Ex: "player_1730283000_abcde"
  gameId: string;           // "meudon-sunday-next"
  name: string;             // Prénom / Nom du joueur
  paymentMethod: 'paypal' | 'revolut' | 'cash' | 'none';
  paymentStatus: 'paid' | 'pending' | 'exempt';
  isWaitingList: boolean;   // true si > 10 joueurs
  team?: 'A' | 'B' | 'unassigned';
  order: number;            // Index séquentiel d'inscription (1, 2, 3...)
  createdAt: string;        // ISO Date String
}
```

#### 3. Sous-collection `/games/{gameId}/refunds/{refundId}`
```typescript
interface RefundRequest {
  id: string;               // Ex: "refund_1730283500_xyz12"
  gameId: string;
  playerId: string;
  playerName: string;
  amount: number;
  currency: string;
  originalPaymentMethod: 'paypal' | 'revolut';
  refundMethod: 'paypal' | 'revolut';
  refundHandle: string;     // Ex: email paypal ou @Revtag
  status: 'pending' | 'completed';
  createdAt: string;
  refundedAt?: string;
}
```

### Synchronisation Temps Réel & Hors Ligne
- L'application écoute en continu les changements Firestore via les hooks `onSnapshot` de Firebase dans `src/lib/gameService.ts`.
- Dès qu'un joueur s'inscrit, change d'équipe, annule, ou qu'un remboursement est validé sur un téléphone, **tous les autres smartphones connectés à la page sont mis à jour instantanément sans recharger la page**.
- Si la connexion à Firestore est interrompue ou en cas de quota dépassé, l'application intègre un mécanisme de repli transparent sur `localStorage` avec auto-ensemencement des données par défaut.

### Mécanique d'Intégration WhatsApp
L'implémentation dans `src/lib/whatsapp.ts` résout une contrainte technique majeure des navigateurs mobiles : l'impossibilité d'injecter un texte pré-rempli dans une URL d'invitation de groupe de type `chat.whatsapp.com/invite`.

**La solution appliquée :**
```typescript
export async function dispatchWhatsAppShare(
  message: string,
  groupUrl?: string,
  directPhone?: string
): Promise<{ openedGroup: boolean; copied: boolean }> {
  // 1. Si un lien de groupe est présent :
  // Copie automatique et silencieuse du message dans le presse-papier via Clipboard API
  if (groupUrl && groupUrl.trim().length > 0) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
    }
    // Ouverture directe du groupe WhatsApp ciblé
    window.open(groupUrl.trim(), '_blank', 'noopener,noreferrer');
    return { openedGroup: true, copied: true };
  }

  // 2. Si aucun groupe n'est configuré :
  // Ouverture du protocole api.whatsapp.com/send?text=...
  openWhatsAppDirectly(message, directPhone);
  return { openedGroup: false, copied: false };
}
```
L'interface affiche immédiatement un toast confirmant : *« Message copié dans le presse-papier et groupe WhatsApp ouvert ! »*.

### Algorithmes d'Équilibrage & Gestion des Équipes
- **Attribution automatique à l'inscription** : Lors de l'inscription d'un titulaire, le système compte les effectifs existants dans l'Équipe A et l'Équipe B et l'assigne à l'équipe la moins peuplée.
- **Tirage au sort & Rééquilibrage aléatoire** (`balanceTeams`) : Utilise l'algorithme de mélange de Fisher-Yates / random shuffle pour scinder équitablement les 10 joueurs en 2 équipes de 5.

---

## 4. Règles de Sécurité Firestore

Les règles définies dans `firestore.rules` valident les schémas et la taille des chaînes pour prévenir le spam tout en garantissant une réactivité maximale :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.resource.data.status in ['open', 'closed', 'completed'];

      match /players/{playerId} {
        allow read: if true;
        allow create, update: if request.resource.data.name is string 
          && request.resource.data.name.size() <= 60;
        allow delete: if true;
      }

      match /refunds/{refundId} {
        allow read: if true;
        allow create: if request.resource.data.playerName is string
          && request.resource.data.refundHandle is string;
        allow update, delete: if true;
      }
    }
  }
}
```

---

## 5. Installation et Démarrage Local

### Prérequis
- Node.js (version 18 ou supérieure)
- NPM ou Bun

### Étapes d'installation
```bash
# 1. Cloner le dépôt
git clone <URL_DU_DEPOT>
cd meudon-stars-du-dimanche

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur local de développement
npm run dev
```
L'application est accessible à l'adresse : `http://localhost:3000`.

### Commandes utiles
- `npm run build` : Compile l'application TypeScript & Vite dans le répertoire `dist/`.
- `npm run lint` : Vérifie la validité des types TypeScript (`tsc --noEmit`).
- `npm start` : Démarre le serveur Node / Express de production (`server.ts`).

---

## 6. Guide de Déploiement

### Déploiement sur Vercel (Gratuit)
1. Importez le projet sur [Vercel](https://vercel.com).
2. Framework Preset : `Vite`.
3. Build Command : `npm run build`.
4. Output Directory : `dist`.
5. Cliquez sur **Deploy**.

### Déploiement sur Firebase Hosting (Gratuit)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Définir le dossier public comme 'dist'
# Configurer comme Single Page App (SPA) : Oui
npm run build
firebase deploy --only hosting
```

---

*Projet développé pour la communauté du dimanche à Meudon.*
