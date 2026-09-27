# Domain, email and hosting — step by step

Everything needed to take the site from a repository to a live address with a
working contact form. Written for someone who has not set up DNS before: each
step says where to click and what to copy, and the order matters.

Decisions already made (see `TODO.md` §1):

- **Domain:** `torchyan.design`, registered at GoDaddy. The canonical address is
  the bare domain, **without `www`**.
- **Host:** Vercel, Hobby (free) plan.
- **Mail:** Resend sends the contact form. There is no mailbox on the domain yet.

Budget: **free**, unless you choose a paid mailbox in step 5.

---

## What connects to what

Three separate things live on one domain, and they are set up independently:

| | What it does | Needs |
| --- | --- | --- |
| **The site** | Serves torchyan.design | An `A` record pointing at Vercel |
| **Sending mail** | The contact form emails you | `TXT` and `MX` records from Resend |
| **Receiving mail** | `hello@torchyan.design` reaches you | A forwarder, or a paid mailbox |

Sending and receiving are not the same thing. The contact form only needs
**sending**: it mails *from* `noreply@torchyan.design` *to* your personal inbox.
That address never receives anything, so it needs no mailbox. Receiving is only
for the address printed in the footer, so people can write to you directly.

---

## Step 1 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in **with GitHub**.
2. **Add New → Project**, pick `Torchian/torchyan-portfolio`.
3. Vercel detects Next.js on its own. Change nothing in the build settings.
4. **Deploy.**

You get a working address like `torchyan-portfolio.vercel.app` in a couple of
minutes. The real domain comes in step 2.

> If the build fails, the log names the step. The same checks run in CI on every
> push (`.github/workflows/ci.yml`), so a green CI run means the build itself is
> sound.

## Step 2 — Point the domain at Vercel

**In Vercel:** Project → **Settings → Domains** → add `torchyan.design`.

Vercel will show you the records it wants. It also offers `www.torchyan.design`
— add it too and set it to **redirect to `torchyan.design`**, since the bare
domain is canonical.

**In GoDaddy:** **My Products → Domains → torchyan.design → DNS → Manage Zones**.

Add what Vercel asked for. As of today that is:

| Type | Name | Value |
| --- | --- | --- |
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

**Copy the values from Vercel's own screen, not from this table** — Vercel
changes them from time to time, and its screen is always right.

If GoDaddy already has an `A` record on `@` (a parking page), **edit** it rather
than adding a second one.

Then wait. DNS takes anywhere from a few minutes to a few hours. Vercel's Domains
page shows a green tick when it sees the change.

## Step 3 — Set up Resend

1. Sign up at [resend.com](https://resend.com) — the free plan sends 3,000 emails
   a month, far more than a portfolio form will ever use.
2. **Domains → Add Domain** → `torchyan.design`.
3. Resend shows three records. Add each one in GoDaddy the same way as step 2:

| Type | Roughly what it looks like | What it is for |
| --- | --- | --- |
| `TXT` | `resend._domainkey` → a long key | **DKIM** — signs your mail so it is provably yours |
| `TXT` | `send` → `v=spf1 include:amazonses.com ~all` | **SPF** — says which servers may send as you |
| `MX` | `send` → `feedback-smtp.<region>.amazonses.com` | Bounce handling |

Again: **copy from Resend's screen.** The key is unique to you.

4. Back in Resend, press **Verify**. It may take a few minutes.
5. **API Keys → Create API Key**, permission **Sending access**. Copy it now —
   it is shown once. It starts with `re_`.

> **This key is a password.** Never put it in the repository, in a screenshot, or
> in a chat. It goes only where step 4 says.

### Add DMARC as well

Resend does not ask for it, but without it some providers treat your mail with
suspicion. In GoDaddy add:

| Type | Name | Value |
| --- | --- | --- |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:<your personal email>` |

`p=none` means "watch, don't block" — the right setting to start with. You will
get occasional reports at that address about who is sending as your domain.

## Step 4 — Give Vercel the three variables

**Vercel → Project → Settings → Environment Variables.** Add these for
**Production, Preview and Development**:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://torchyan.design` |
| `RESEND_API_KEY` | The `re_…` key from step 3 |
| `CONTACT_FROM` | `Torchyan Portfolio <noreply@torchyan.design>` |
| `CONTACT_TO` | Your personal inbox, e.g. your Gmail |

Then **Deployments → the latest one → Redeploy**. Environment variables are read
at build time, so an existing deployment will not pick them up on its own.

`CONTACT_FROM` must be on the domain verified in Resend, or it will refuse to
send. The mailbox does not need to exist — nothing ever replies to it, because
the form puts the sender's own address in `Reply-To`.

### Checking it

Open the live site, fill the form and send. You should see the green confirmation
and get the mail within a minute.

If it shows the error message instead, open **Vercel → your project →
Logs** and look for a line starting `[contact]`. It names the cause: missing
configuration, or Resend refusing. The site never shows that detail to visitors,
on purpose.

## Step 5 — Receiving mail at hello@torchyan.design

Only for the address in the footer. Skip it and the contact form still works.

**Option A — forwarding (free, recommended to start).**
In GoDaddy look for **Email Forwarding** under the domain. Forward
`hello@torchyan.design` to your personal inbox. Availability and price vary by
region and by what came bundled with the domain; check the domain's own page.

The limitation: you can *receive* but not *reply as* `hello@torchyan.design`.
Replies come from your personal address.

**Option B — a real mailbox (paid).** Google Workspace or Microsoft 365, roughly
$6–7 a month. You get a proper inbox and can reply as `hello@torchyan.design`.

Worth it only when clients actually start writing. Start with A.

> A mailbox adds its **own** `MX` records for the whole domain, which is a
> different thing from Resend's `MX` on the `send` subdomain. They do not
> conflict — but if you set up a mailbox later, do not delete Resend's record.

---

## Order and timing

1. **Step 1** — deploy. Minutes.
2. **Step 2** — domain. Minutes to a few hours for DNS.
3. **Step 3** — Resend. Minutes, plus verification.
4. **Step 4** — variables and redeploy. Minutes.
5. **Step 5** — whenever you want.

Steps 2 and 3 both edit DNS and can be done in one sitting.

---

## If something does not work

**The site does not open on the domain.** DNS has not propagated, or the `A`
record is wrong. Check on [dnschecker.org](https://dnschecker.org) — it shows
what the world sees rather than what your own computer has cached. Vercel's
Domains page also states plainly what it is still waiting for.

**Resend will not verify.** Nearly always a record pasted with something extra.
Two classic mistakes in GoDaddy: typing `resend._domainkey.torchyan.design`
where GoDaddy wants only `resend._domainkey` (it appends the domain itself), and
a trailing space in a copied value.

**The form shows an error.** `[contact]` in the Vercel logs, as in step 4.

**The mail arrives in spam.** Check that all three Resend records verified, and
that DMARC is present. If you skipped DMARC, add it.

---

## Afterwards

Once the site is live, three things in `TODO.md` become doable and are worth
doing early:

- **Enforce the CSP.** It is report-only today, because the analytics parts of
  the policy cannot be tested without the analytics keys. See
  `docs/audits/2026-09-27-header-and-accessibility.md` §4.
- **Take the performance baseline on the real site.** The current numbers come
  from a shared-CPU container; see `docs/audits/2026-09-27-performance-baseline.md`.
- **Submit the sitemap** in Google Search Console, and check that the three
  languages resolve.
