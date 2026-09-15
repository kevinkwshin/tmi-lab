# Connecting tmi-lab.org

The GitHub Pages project URL stays in use until DNS account access is available. Do not set a custom domain prematurely: GitHub can redirect the working project URL to a domain that does not yet resolve to Pages.

## Current DNS (2026-09-15)

- Nameservers: `ns1.hosting.co.kr` through `ns4.hosting.co.kr`.
- Apex A: `75.2.85.42`, `99.83.196.71`.
- `www` CNAME: `tmi-lab.org.`.

## Connection sequence

When the DNS management account is available, coordinate these steps:

1. In GitHub repository **Settings → Pages**, set the custom domain to `tmi-lab.org`.
2. In the existing DNS provider, replace only the website records with the following; preserve email and unrelated records.

| Name | Type | Value |
|---|---|---|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `www` | CNAME | `kevinkwshin.github.io.` |

3. Set the repository Actions variable `SITE_URL` to `https://tmi-lab.org/` and rerun **Publish TMI Lab**. This changes canonical, alternate-language, sitemap, and error-page links. A `CNAME` file is not required for this Actions publishing workflow.
4. Wait for GitHub's DNS check and TLS certificate issuance, then enable **Enforce HTTPS**.
5. Open the Korean and English pages over HTTPS; verify the language button, images, and `www` redirection.

Access to the existing DNS management account is required; a GitHub push cannot update registrar DNS.

Sources: [GitHub custom domain configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages).
