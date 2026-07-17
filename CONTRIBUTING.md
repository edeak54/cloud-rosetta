# Contributing to Cloud Rosetta

The dictionary lives in `data/entries.json`. Everything else is rendering.

## Adding or improving an entry

Each entry follows this schema:

```json
{
  "uni": "Universal concept name",
  "pos": "n., category-word",
  "cat": "Category",
  "aws":   { "n": "AWS service name",   "d": "one-line description with the AWS-specific detail" },
  "azure": { "n": "Azure service name", "d": "one-line description with the Azure-specific detail" },
  "gcp":   { "n": "GCP service name",   "d": "one-line description with the GCP-specific detail" },
  "usage": "Where the analogy breaks. The concrete trap that bites during a real migration — not marketing copy.",
  "tf": {
    "aws": "aws_resource_name",
    "azure": "azurerm_resource_name",
    "gcp": "google_resource_name"
  }
}
```

Rules enforced by CI (`npm test`):

1. Every entry must be **fully trilingual** — name and description for all three clouds.
2. `usage` is **mandatory** and must be substantive (>30 chars). If the mapping has no
   interesting break, it probably doesn't need an entry.
3. Terraform names must carry the correct provider prefix (`aws_`, `azurerm_`, `google_`).
   Append `(data)` for data sources; use `—` when no resource exists.
4. No duplicate `uni` names.

## What makes a good `usage` note

Bad: "These services are similar but have some differences."
Good: "Azure's extra layer bites Terraform modules: the Storage Account (not the
container) owns networking, keys, and replication — an S3-bucket-shaped module
won't port cleanly."

Write the sentence you wish someone had told you before your migration.

## Workflow

```bash
npm test         # your entry must pass validation
npm run build    # confirm the site still builds
```

Open a PR with the entry and one line on your source: production experience,
official docs, or provider changelog. Production scars rank highest.
