FROM oven/bun:1.1-slim

COPY . .
RUN bun install --frozen-lockfile

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]