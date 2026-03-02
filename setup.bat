@echo off
REM Script para inicializar el proyecto Family Calendar App

echo.
echo ======================================================
echo   Family Calendar App - Setup Inicial
echo ======================================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en PATH
    echo Descarga Node.js desde https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js encontrado: 
node --version

echo.
echo [1/4] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend
    exit /b 1
)
cd ..

echo.
echo [2/4] Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    exit /b 1
)
cd ..

echo.
echo [3/4] Verificando MySQL...
where mysql >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] MySQL encontrado
    echo IMPORTANTE: La base de datos se inicializará automáticamente al iniciar el servidor
) else (
    echo [ADVERTENCIA] MySQL no se encuentra en PATH
    echo Asegúrate de que MySQL está ejecutándose en localhost:3306
)

echo.
echo [4/4] Verificando configuración...
if exist backend\.env (
    echo [OK] Archivo .env encontrado
) else (
    echo [ADVERTENCIA] Archivo .env no encontrado, creando...
)

echo.
echo ======================================================
echo   CONFIGURACIÓN COMPLETADA
echo ======================================================
echo.
echo Para iniciar la aplicación:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm start
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo Frontend estará disponible en: http://localhost:3000
echo Backend estará disponible en: http://localhost:3001
echo.
echo Asegúrate de que:
echo   - MySQL está ejecutándose
echo   - Ollama está ejecutándose (para el asistente)
echo   - Usando modelo Phi3: ollama run phi3:3.8b
echo.
echo ======================================================
echo.

pause
