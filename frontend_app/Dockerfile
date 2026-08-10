FROM node:20-alpine AS build
WORKDIR /app
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=1536
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]