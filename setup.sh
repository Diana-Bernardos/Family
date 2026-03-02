#!/bin/bash

# Script para inicializar el proyecto Family Calendar App

echo ""
echo "======================================================"
echo "   Family Calendar App - Setup Inicial"
echo "======================================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Descarga Node.js desde https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js encontrado:"
node --version

echo ""
echo "[1/4] Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al instalar dependencias del backend"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Instalando dependencias del frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al instalar dependencias del frontend"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Verificando MySQL..."
if command -v mysql &> /dev/null; then
    echo "[OK] MySQL encontrado"
    echo "IMPORTANTE: La base de datos se inicializará automáticamente al iniciar el servidor"
else
    echo "[ADVERTENCIA] MySQL no se encuentra en PATH"
    echo "Asegúrate de que MySQL está ejecutándose en localhost:3306"
fi

echo ""
echo "[4/4] Verificando configuración..."
if [ -f "backend/.env" ]; then
    echo "[OK] Archivo .env encontrado"
else
    echo "[ADVERTENCIA] Archivo .env no encontrado"
fi

echo ""
echo "======================================================"
echo "   CONFIGURACIÓN COMPLETADA"
echo "======================================================"
echo ""
echo "Para iniciar la aplicación:"
echo ""
echo "Terminal 1 - Backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "Frontend estará disponible en: http://localhost:3000"
echo "Backend estará disponible en: http://localhost:3001"
echo ""
echo "Asegúrate de que:"
echo "   - MySQL está ejecutándose"
echo "   - Ollama está ejecutándose (para el asistente)"
echo "   - Usando modelo Phi3: ollama run phi3:3.8b"
echo ""
echo "======================================================"
echo ""
