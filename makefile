.PHONY: help start migrate reset-db clear-migrations wifi-ip

help:
	@echo Available commands:
	@findstr /R /B /C:".*##" Makefile

start: ## Démarre le serveur avec ts-node
	npx ts-node index.ts

migrate: ## Crée une migration Prisma avec nom demandé
	@read -p "Commit of your migration: " msg; \
	npx prisma migrate dev --name $$msg

reset-db: ## Réinitialise la base de données avec Prisma
	npx prisma migrate reset

clear-migrations: ## Supprime toutes les migrations locales
	rm -rf prisma/migrations

wifi-ip: ## Affiche l'adresse IP locale (macOS)
	ipconfig getifaddr en0
