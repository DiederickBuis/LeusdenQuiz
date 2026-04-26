# MijnCRM - Eenvoudige CRM Applicatie

Een eenvoudige CRM (Customer Relationship Management) applicatie gebouwd met React, Vite en Supabase.

## Functionaliteiten

- **Dashboard** - Overzicht met statistieken, deal pipeline en recente activiteiten
- **Contacten** - Beheer contactpersonen met naam, e-mail, telefoon, bedrijf en functie
- **Bedrijven** - Beheer bedrijven met branche, website, adres en contactinformatie
- **Deals** - Beheer deals met pipeline-weergave en tabelweergave (Lead → Contact → Offerte → Onderhandeling → Gewonnen/Verloren)
- **Activiteiten** - Log telefoongesprekken, e-mails, vergaderingen, notities en taken

## Setup

### 1. Database instellen

Ga naar de Supabase SQL Editor en voer het `supabase-schema.sql` bestand uit:
- Open: https://supabase.com/dashboard/project/tvtmipkyfkbgmwcrtxyi/sql/new
- Kopieer en plak de inhoud van `supabase-schema.sql`
- Klik op "Run"

### 2. Anon Key instellen

- Ga naar: https://supabase.com/dashboard/project/tvtmipkyfkbgmwcrtxyi/settings/api
- Kopieer je **anon/public** key
- Open `.env` en vervang `JOUW_ANON_KEY_HIER` met je echte key

### 3. Applicatie starten

```bash
cd crm-app
npm install
npm run dev
```

Open http://localhost:5173 in je browser.

## Technologieën

- **React 19** - UI framework
- **Vite** - Build tool
- **Supabase** - Backend-as-a-Service (PostgreSQL database)
- **React Router** - Client-side routing
- **Lucide React** - Iconen
