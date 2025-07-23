# 🚀 DevOps 2025 — Backend Prisma + MySQL + UUID

Ce projet utilise Prisma ORM avec une base de données MySQL. Tous les identifiants (`id`) sont des UUIDs.

---

## ✅ Prérequis

- Node.js (v18+)
- MySQL (local ou distant)
- Prisma (`npm install prisma --save-dev`)
- Un gestionnaire de paquets (npm ou yarn)

---

## ⚙️ Installation

```bash
git clone https://github.com/<ton-utilisateur>/<ton-repo>.git
cd <ton-repo>

# Installer les dépendances
npm install
# ou
yarn install

# Pour run toute les migration
npx prisma migrate dev 

```



| Commande                 | Description                              |
| ------------------------ | ---------------------------------------- |
| `npx prisma generate`    | Régénère le client Prisma                |
| `npx prisma migrate dev --name xxx` | Crée une migration et l'applique         |
| `npx prisma studio`      | Ouvre une interface web pour la base     |
| `npx prisma db pull`     | Tire le schéma depuis une base existante |
