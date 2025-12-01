# Etapa 1: Construcción (Build)
FROM node:20-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build -- --configuration production

# Etapa 2: Servidor Web (NGINX)
FROM nginx:alpine

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
# IMPORTANTE: Verifica si tu build genera la carpeta /browser. 
# En Angular 17+ con application builder, la ruta suele ser dist/nombre-proyecto/browser
COPY --from=build /app/dist/restaurante-delivery/browser /usr/share/nginx/html

# Exponer el puerto 80 (Railway lo mapeará automáticamente)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]