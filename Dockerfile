FROM node:20-alpine

LABEL maintainer="Gabriele Martire <gabrielemartire@github>"
LABEL description="Walton - Analyze npm dependencies and find better-maintained forks"

# Set the working directory
WORKDIR /walton

# Copy the source files
COPY walton.js ./
COPY dep.js ./

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
