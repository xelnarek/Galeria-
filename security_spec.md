# Firebase Security Rules Specification

## Data Invariants
1. `artworks` collection:
   - Contains gallery artworks.
   - Each document must contain valid required fields: `id` (string), `slug` (string), `title` (string, max 300 chars), `image` (string, max 2000 chars), `order` (number).
   - Any write must enforce field types, size limits, and system timestamps.
2. `metadata` collection:
   - Stores `artist` profile and `collection` information documents.
   - Valid string fields and length limits enforced.

## The Dirty Dozen Payloads (Targeted Malicious Payloads)
1. Shadow update with ghost fields (e.g. `isAdmin: true` injected into an artwork).
2. Overlong ID Injection (>128 chars).
3. Overlong string in artwork title (>300 chars).
4. Malicious URL/script payload in image URL (>2000 chars).
5. Missing required fields during creation (e.g. missing `title` or `image`).
6. Invalid type in numerical field (e.g. `order: "invalid"` instead of a number).
7. Unauthenticated write or privilege escalation.
8. Modifying immutable field `id` or `createdAt` on update.
9. Invalid `status` enum value (e.g. `status: "hacked"`).
10. Excessive array size or nested payload poisoning.
11. PII exposure or unauthorized document deletion.
12. Invalid timestamp injection during document modification.
