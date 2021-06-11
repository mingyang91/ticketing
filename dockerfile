FROM node:alpine AS build

WORKDIR /opt/app/

ADD ./package*.json package.json
RUN npm install


ADD ./prisma prisma
RUN npx prisma generate

ADD ./tsconfig.json tsconfig.json
ADD ./tsconfig.build.json tsconfig.build.json
ADD ./nest-cli.json nest-cli.json
ADD ./src src

RUN npm run build

# RUN ls -al & sleep 30

FROM node:alpine

ENV NODE_ENV=production

WORKDIR /opt/app/

ADD ./package*.json package.json
RUN npm install --production

COPY --from=build /opt/app/dist dist
COPY --from=build /opt/app/node_modules/.prisma/client node_modules/.prisma/client

EXPOSE 3000

CMD ["node", "dist/main.js"]