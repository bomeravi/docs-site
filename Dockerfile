FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG DOCS_URL=https://docs.digi-kube.sajiloapps.com
ARG DOCS_BASE_URL=/
ENV DOCS_URL=${DOCS_URL}
ENV DOCS_BASE_URL=${DOCS_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
