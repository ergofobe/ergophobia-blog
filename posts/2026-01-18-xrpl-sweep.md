---
title: Sweeping XRP with a Simple Node.js Tool – Recover Your Reserve in Minutes
description: A secure CLI tool to sweep XRP from any BIP-39 mnemonic wallet and reclaim most of the 1 XRP account reserve using AccountDelete.
date: 2026-01-18 18:43:00
author: Jim Phillips
tags:
  - xrpl
  - xrp
  - cryptocurrency
  - node.js
  - wallet-recovery
  - bip39
layout: article.njk
---

If you've ever held XRP on the XRP Ledger, you know about the account reserve — currently 1 XRP that stays locked forever to keep your address active and prevent spam. That 1 XRP is often the last piece left when you're trying to consolidate or migrate wallets.

Recovering that reserve has always been a bit manual, but it doesn't have to be a hassle. I created a small, secure Node.js command-line tool called xrpl-sweep that handles the entire process in one straightforward session:

- Import a BIP-39 mnemonic (12, 15, 18, 21, or 24 words)
- Derive your classic XRP address
- Check your current balance and the network's reserve requirements
- Send any spendable XRP above the reserve
- Submit an AccountDelete transaction to recover roughly 0.8 XRP (after the ~0.2 XRP burn fee)

All from the terminal — no graphical interface, no browser extensions, just plain text prompts.

## Why I Built It

Over the years I've ended up with several old XRP addresses from different wallets: Trust Wallet, early software clients, various derivations — most with just the reserve sitting untouched. Manually sending the spendable balance and then deleting the account each time got old, especially with less common mnemonic lengths like 18 words.

I wanted something that:
- Handles all standard BIP-39 mnemonic lengths
- Clearly shows balance, reserves, and what's actually spendable
- Does the full sweep (send + delete) in one go
- Keeps everything transparent and easy to follow

So xrpl-sweep was born.

## What a Typical Run Looks Like

1. You start the tool with `npm start` or `node xrpl-sweep.js`.
2. It greets you and asks for your mnemonic (entered securely with hidden input).
3. It derives and displays your address.
4. It connects to the XRPL (mainnet by default), fetches your balance, the current base reserve (1 XRP), and owner reserve (0.2 XRP per object).
5. If your account has no owner objects (trust lines, offers, etc.), it proceeds.
6. It tells you the approximate spendable amount above reserve.
7. You enter the destination address.
8. It shows a summary of what will happen: send spendable XRP, then delete the account and forward the remaining reserve (minus burn).
9. You confirm with y/n.
10. If there's spendable XRP, it submits a Payment transaction.
11. Then it submits the AccountDelete.
12. If both succeed, it prints a success message and disconnects.

## Security Notes

The tool uses a hidden prompt for your mnemonic so it doesn't echo on screen. Never share your seed phrase. Do not save it to disk or expose it in any way. Always double-check that the derived address matches the wallet you expect before confirming the sweep.

## Test It Safely First

The script has easy testnet support. Change one line to TESTNET = true, fund a test account at testnet.xrpl.org, and run through the whole process before touching real funds.

## Open Source & MIT Licensed

The full project lives on GitHub at https://github.com/ergofobe/xrpl-sweep

Feel free to fork it, audit it, improve it, or just read the code as an example of using the xrpl.js library.

## Final Thoughts

The XRP Ledger is fast and cheap, but little things like the reserve can add up when you're cleaning house. A simple tool like this makes the process less annoying without needing to rely on third-party apps.

If you try it, spot a bug, or want to add features (dry-run mode, batch support, etc.), hit me up on X at @ergophobe.

Happy sweeping — and may your old reserves find peace.

— Jim