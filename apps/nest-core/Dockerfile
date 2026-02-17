FROM node:20-alpine

WORKDIR /app

COPY dist/apps/nest-core ./

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

ENV PORT=3000
EXPOSE 3000

CMD ["node", "main.js"]

