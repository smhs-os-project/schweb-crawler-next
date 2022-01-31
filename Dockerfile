# using multistage build, as we need dev deps to build the TS source code
FROM node:16 AS builder

WORKDIR /workspace

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn/ ./.yarn/

RUN yarn

COPY . ./
RUN yarn build

# create final image, copy only package.json, readme and compiled code
FROM node:16

WORKDIR /workspace

# Copy the installed dependencies from the previous stage.
COPY --from=builder \
    /workspace/README.md /workspace/.yarnrc.yml /workspace/.pnp.cjs \
    /workspace/package.json /workspace/yarn.lock \
    ./
COPY --from=builder /workspace/dist/ ./dist/
COPY --from=builder /workspace/data/CNAME ./data/CNAME
COPY --from=builder /workspace/.yarn ./.yarn/

# run compiled code
CMD yarn start:prod
