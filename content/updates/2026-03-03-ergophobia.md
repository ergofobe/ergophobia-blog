---
title: "ergophobia — week of 2026-03-02"
date: 2026-03-03
description: "Added Docker support so the blog builds and runs the same way in development and production."
project: "ergophobia"
tags: [ergophobia, docker]
---

A short, focused week with a single change worth logging: I added Docker support to the project. That meant a Dockerfile, a docker-compose setup covering both development and production configurations, and a .dockerignore to keep the build context lean by leaving out everything the image doesn't need.

The motivation was reproducibility. Running the Eleventy build inside a container meant I could spin the site up the same way regardless of what was installed on the machine in front of me, and have a defined path from local development to a production build rather than relying on whatever Node version happened to be on the host. Compose made it a one-command thing to start the dev server with live reload.

It wasn't a flashy change, but it removed a class of "works on my machine" friction, and that was the whole goal for the week.
