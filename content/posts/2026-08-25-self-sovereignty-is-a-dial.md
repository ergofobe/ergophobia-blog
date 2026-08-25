---
title: "Self-sovereignty is a dial"
date: 2026-08-25T00:00:00
description: "I took my mail off Google. The rest of the internet still gets a vote."
cover: "/img/covers/self-sovereignty-is-a-dial.jpg"
coverAlt: "A rotary selector switch on a dark steel panel, set between its stops, one green lamp lit."
tags: [self-hosting, privacy]
---

The goal was to de-Google ergophobia.org. Mail first. The site came with
it, because once you're standing up a public box you might as well put
the public origin on it too.

I don't like my bits sitting on someone else's disk under someone else's
terms. Google's are not subtle. You don't own what you store there, and
they are not liable for what happens to it. You depend on them to keep
it safe and to obey the law. I think we've moved past trusting them.

So I rented a VPS. A Hetzner Cloud CX23 in Falkenstein, Debian 12,
roughly €4–5 a month. Mail off Gmail, site off Cloudflare Workers, same
box, same week.

The rest is why "just self-host it" is not a switch you flip.

## Other people's rules

I wanted one hosting company. Not Google, not a pile of mail vendors,
not a different account for every piece. Cloudflare could stay for DNS.
It's free, I already manage it from the CLI, and I already use their
tunnels to reach private apps in my home lab. Everything public would
live on one always-on node.

The first host I looked at advertised paying in crypto and skipping KYC.
No card on file. That sounded right, until it didn't. They resell the
big American clouds, and those clouds block outbound mail, because the
last renter used the box to send spam. I would have rented a server
that could not send mail. Dead end.

Hetzner will actually give you a real machine with root. They will also
block outbound ports 25 and 465 on a new account, for the same reason:
too many new customers are a problem. So mail leaves the VPS through
SMTP2GO's free tier. A temporary crutch, not a design choice. Once the
account has some age and a paid invoice on it, I can ask them to
unblock direct SMTP and drop the relay. Until then, leaving Google
meant handing outbound to someone else.

I asked which country was better for privacy. Finland, in theory. The
cheap box in stock was Germany. Jurisdiction is another thing you don't
fully pick. You pick what's available at the price you're willing to
pay.

Even after Hetzner opens port 25, I'll still have to play by rules I
don't write. OpenDKIM signs what goes out. SPF and DMARC live in DNS.
Those records are how the rest of the internet decides whether to
believe me. Skip them and I'm a spammer. Publish them and I'm in a
reputation system I don't control.

The protocol is open. Getting other people's servers to listen is the
actual work. I don't blame them. I also don't pretend the VPS makes me
independent of them.

## A spool, not a mailbox

I was not comfortable leaving mail sitting on a disk in Germany. IMAP
would have been the convenient default. It is also just moving the
Google problem east.

So Postfix takes inbound on port 25, Dovecot offers POP3S on 995 and
nothing else, and this laptop fetches and deletes. The VPS is a spool.
Mail actually lives here.

If the VPS dies, I lose whatever hasn't been fetched yet. That's the
trade. I can live with a short spool. I can't live with a copy of my
mail at rest on a rented disk because it was convenient.

The site is a tenant on the same node because public things need a
machine that stays up. My home lab is not that machine. It isn't
fancy, we get power outages, and a tunnel back to the basement is a
fragile way to hang a domain. Private apps can live with that. MX
records and a website cannot. Caddy serves the static files Hugo
builds. The contact form used to be a Worker. Now it's a small service
on the same host, talking to local sendmail. The running copy is mine.
The mail it sends does not go back to Google.

## What I didn't take

DNS is still at Cloudflare. When you look up the name, they tell you
the VPS address, and that's the end of their job. The web and mail
records are not proxied through their network. Grey-cloud, in their
terms. A proxy in front of mail breaks it, and a proxy in front of the
site would hide the box I just stood up. I kept them because I already
used them. I don't want them sitting between a visitor and the page.

Private apps still live in the home lab. I reach them through a
Cloudflare tunnel. That's a small program on the home box that opens an
outbound connection, so I don't have to punch holes in the home
firewall. Someone else's path to my own house. Fine for things that
aren't public. I can't live with the house being the MX record.

The Hetzner account itself is still on Gmail. It has to be. If the
login for the box is the mailbox the box is supposed to receive, the
first outage is a lockout. So de-Googling the domain still leaves a
Google account paying the bill.

GitHub is still where the source lives. The VPS pulls. I wanted to own
the running origin, not pretend I host git.

I still use other people's computers for names, for outbound mail, for
a path back to the basement, for the copy of the repo, and for the
invoice. The dial moved. It didn't hit the stop.

## Keeping nothing

The thing I could not buy from Google, and could not buy from Workers,
is the right to keep nothing.

Logging on the VPS is near-zero on purpose. journald keeps logs in
memory only, for hours, and they're gone on reboot. Postfix, Dovecot,
Caddy and the contact service all discard theirs. The site keeps no
visitor logs at all. The firewall is at the edge, not a program on the
box hoping to catch someone after they're in.

A privacy choice, and the thing I'm happiest about. Running my own box
is what makes it possible to keep nothing, which is the opposite of
Gmail, and of every hosted platform that would like to know you were
here.

Sovereignty of the individual is a principle. On a mailbox and a
website that just means I decide who holds the mail and who sees the
logs. The rest of the network still gets a vote, and some clicks stay
unturned.

The dial moved a few clicks. I can live with the ones I didn't turn.

... for now.
