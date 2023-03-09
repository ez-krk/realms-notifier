FROM node:18.12.1

# install pnpm
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm
RUN chmod +x /bin/pnpm

# copy files relevant to the project required by pnpm
COPY ./* ./

RUN pnpm install --frozen-lockfile
RUN pnpm build

# Bundle app source
COPY . .

EXPOSE 3003
CMD [ "ts-node", "./src/index.ts" ]