# Database Scripts

## Active Scripts

### `extractKeywords.js` - Extract and Update Keywords
Automatically extracts mechanic keywords from card ability text and updates the `keywords_mechanic` field in the database.

**Usage:**
```bash
node scripts/extractKeywords.js
```

**What it does:**
- Scans all card collections in the database
- Extracts keywords from: ability, ability_text, sub_skill_1, sub_skill_2, unity_effect, unity_effect_2, unity_effect_3
- Matches against predefined KEYWORD_MECHANICS list
- Updates `keywords_mechanic` field with found keywords
- Shows progress and results for each collection

### `updateImages.js` - Update Card Images
```bash
node scripts/updateImages.js              # From code
node scripts/updateImages.js cards.json   # From JSON file
```

### `upsertCard.js` - Insert/Update Cards
```bash
node scripts/upsertCard.js
```

---

## ?? Migration Scripts (������)

- `migrateToDeckDB.js` - ���¢����� Card  Deck DB
- `migrateCardNames.js` - �Ѿവ���͡���

---

## ?? API Endpoints

**�Ѿവ��������:**
```bash
POST /api/admin/update-image
{"cardName":"Star-Lord","imageUrl":"https://..."}
```

**�Ѿവ���¡���:**
```bash
POST /api/admin/update-images-bulk
{"images":[{"cardName":"...","imageUrl":"..."}]}
```
