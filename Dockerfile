# syntax=docker/dockerfile:1

# Multi-stage: Node build → nginx static runtime on port 8080

FROM node:26-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Bake public path / title into the Vite client bundle
ARG VITE_BASE_URL=/
ARG VITE_APP_TITLE=Noto
ENV VITE_BASE_URL=$VITE_BASE_URL \
    VITE_APP_TITLE=$VITE_APP_TITLE

RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Non-root nginx needs writable pid/log paths and wget for HEALTHCHECK
RUN apk add --no-cache wget \
  && rm -rf /usr/share/nginx/html/* \
  && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
  && touch /var/run/nginx.pid \
  && chown nginx:nginx /var/run/nginx.pid

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
