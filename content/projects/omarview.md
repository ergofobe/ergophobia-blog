---
title: "omarview"
date: 2026-11-24
summary: "Mission Control for Omarchy. Workspaces, windows, and a live picture of each one, including on ARM where the compositor hook doesn't run."
status: "active"
repo: "https://github.com/ergofobe/omarview"
demo: ""
tags: [omarchy, hyprland, qml]
---

## Overview

A workspace overview for Omarchy, in the Mission Control sense. One overlay
shows the workspaces and the windows on them, each window as a live picture,
and you can move through them with the keyboard or a click. F3 opens it. So
does the top-right corner of the screen.

The compositor plugin that usually does this hooks Hyprland's render path,
and those hooks only exist on x86_64. Omarview doesn't use that hook. It
lives in the shell, which can already ask Hyprland for the window list and
for a copy of each window. That works on this ARM laptop.

## How it works

While the overlay is open, every window is told to keep drawing, and the
overlay changes one pixel on a timer so the monitor commits a new frame.
That's what makes the tiles move. Close the overlay and both of those stop.
A program that refuses to paint while it's covered stays on its last frame.

**Stack:** QML · Omarchy shell · Hyprland toplevel export · Apache-2.0.

The longer version is the [write-up](/posts/2026-11-24-omarview/).
