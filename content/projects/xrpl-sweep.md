---
title: "xrpl-sweep"
date: 2026-01-18
summary: "CLI to recover XRP account reserves from any BIP-39 mnemonic via AccountDelete."
status: "active"
repo: "https://github.com/ergofobe/xrpl-sweep"
demo: ""
weight: 10
tags: [xrp, cli]
---

## Overview

A small, secure Node.js command-line tool that imports a BIP-39 mnemonic and
sweeps XRP from the XRP Ledger — reclaiming most of the 1 XRP account reserve
that otherwise stays locked forever. I'd accumulated several old XRP addresses
across wallets with just the reserve sitting untouched, and recovering it by hand
each time got old. So I built the whole sweep into one transparent session.

## How it works

Enter a mnemonic (12–24 words, hidden input), and the tool derives your classic
address, fetches your balance and the network's base and owner reserves, sends
any spendable XRP above the reserve, then submits an `AccountDelete` to recover
roughly 0.8 XRP (after the burn fee). All from the terminal — no GUI, no browser
extension.

**Stack:** Node.js · xrpl.js · MIT.

For the full walkthrough, see the
[write-up](/posts/2026-01-18-sweeping-xrp-nodejs-tool/).
