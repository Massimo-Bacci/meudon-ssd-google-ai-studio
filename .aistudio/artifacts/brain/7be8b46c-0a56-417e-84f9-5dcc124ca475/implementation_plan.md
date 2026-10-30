# Direct WhatsApp Group Updates & Smart Clipboard Workflow

Enable one-click group opening using the organizer's configured WhatsApp Group Invite URL (`chat.whatsapp.com/...`), automatically copying the formatted update message to the clipboard so the user lands directly in their dedicated squad group ready to paste and send.

### User Review & Critical Decisions

> [!IMPORTANT]
> WhatsApp invite URLs (`chat.whatsapp.com/...`) do not support query parameters for pre-filling text. Based on your clarification, we have confirmed:
> - **Confirmed Flow**: When a WhatsApp Group link is configured in settings, update buttons will copy the pre-formatted message directly to the clipboard and launch the WhatsApp group link immediately, accompanied by visual confirmation.
> - **Confirmed Scope**: This behavior will apply to all broadcast and match update share actions (Spot Opened Broadcast modal, Match Header Invite button, and Roster alerts), with graceful fallback to the WhatsApp share selector if no group link is configured.

---

### 1. Overview & Core Concept

When organizers manage Sunday 5v5 matches, they have a dedicated WhatsApp group for regular players. Instead of opening a generic WhatsApp contact picker or random chat:
- If the organizer entered a **Lien d'invitation au groupe WhatsApp (Optionnel)** (e.g. `https://chat.whatsapp.com/GXYZ12345`), clicking any WhatsApp share button will:
  1. Instantly copy the message (complete with match date, field, terrain number, prices, and spot alerts) to the device's clipboard.
  2. Open that exact WhatsApp group directly in the app / web.
  3. Show clear, non-intrusive feedback ("*Message copié ! Ouverture de votre groupe WhatsApp... Colle le message dans la discussion*").
- If no group link is entered, it seamlessly falls back to WhatsApp's standard share picker (`api.whatsapp.com/send?text=...`).

---

### 2. User Experience & Visual Design

#### User Flows
1. **Match Header Share ("Inviter sur WhatsApp")**:
   - User clicks **"Inviter sur WhatsApp"** in the hero header.
   - If group link is present: The app copies the formatted invite message, displays a temporary emerald toast banner indicating the message is in the clipboard, and immediately launches the WhatsApp group.
   - If no group link is present: The app opens the standard WhatsApp share dialog.

2. **Spot Opened Broadcast Modal (`WhatsAppBroadcastModal`)**:
   - When a spot opens up (due to cancellation or manual broadcast), the modal displays the message preview.
   - When the user clicks the primary green button:
     - If group link exists: Button says **"Ouvrir le groupe & Copier le message"** with a WhatsApp icon and group badge. Shows an immediate animated checkmark ("Copié dans le presse-papier !") while opening the group URL.
     - A secondary discreet button allows "Partager via le sélecteur WhatsApp classique" if they want to forward to an individual friend instead.

3. **Organizer Drawer**:
   - In the "Groupe WhatsApp" settings section, helpful guidance is shown highlighting that adding the link allows 1-click group opening with auto-copy.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Clipboard Copy + Direct Group Link Navigation**:
  - *Chosen Approach*: `navigator.clipboard.writeText(message)` executed synchronously on user click, followed immediately by opening `game.whatsappGroupUrl`.
  - *Why*: Eliminates the friction of browsing through hundreds of personal chats in WhatsApp; drops the user straight into the match group where a single tap ("Coller" / Paste) posts the announcement.
  - *Alternatives Considered*: Native WhatsApp URL parameter `?text=...` on group link (unsupported by WhatsApp protocol and discarded).

- **Decision 2: Fallback Flexibility**:
  - *Chosen Approach*: When a group link is configured, we still provide a secondary option to use standard WhatsApp share (`api.whatsapp.com/send?text=...`) for when the organizer wants to message an individual player directly.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Match State                           │
│  game.whatsappGroupUrl: "https://chat.whatsapp.com/..."     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   MatchHeader (Hero Share)   │ │  WhatsAppBroadcastModal    │
│  "Inviter sur WhatsApp"      │ │  "Alerte Place Libérée"    │
└──────────────┬───────────────┘ └────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             lib/whatsapp.ts: handleWhatsAppShare            │
│                                                             │
│  1. Group URL exists?                                       │
│     ├── YES ──> navigator.clipboard.writeText(message)      │
│     │          Show visual feedback Toast / Checkmark       │
│     │          window.open(groupUrl, '_blank')              │
│     └── NO  ──> openWhatsAppDirectly(message) (Share sheet) │
└─────────────────────────────────────────────────────────────┘
```

#### Affected Components & Modules
- `src/lib/whatsapp.ts`:
  - Add `dispatchWhatsAppShare(message: string, groupUrl?: string, options?: { onCopied?: () => void })` to centralize copy-and-open behavior.
- `src/components/WhatsAppBroadcastModal.tsx`:
  - Update action buttons: if `event.whatsappGroupUrl` is present, display direct group launch button with auto-copy status and fallback button.
- `src/components/MatchHeader.tsx`:
  - Wire header WhatsApp button to use `game.whatsappGroupUrl` with auto-copy and toast notification.
- `src/components/OrganizerDrawer.tsx`:
  - Keep the configuration field in sync and clarify instructions.

---

### Verification Plan

1. **Group URL Configured**:
   - Add a sample WhatsApp group URL (e.g. `https://chat.whatsapp.com/test-group`) in Organizer settings.
   - Click "Inviter sur WhatsApp" on header -> Verify clipboard contains the formatted message and new tab opens the group URL.
   - Trigger spot alert broadcast modal -> Verify primary button indicates direct group opening, copies text, and opens link.
2. **No Group URL Configured**:
   - Clear the field -> Verify buttons fall back cleanly to `api.whatsapp.com/send?text=...`.
3. **Build & Lint**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript and build errors.
