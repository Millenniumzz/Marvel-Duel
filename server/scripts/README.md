# ??? Database Scripts

## ? Active Scripts

### `updateImages.js` - อัพเดตรูปการ์ด
```bash
node scripts/updateImages.js              # จาก code
node scripts/updateImages.js cards.json   # จาก JSON
```

### `upsertCard.js` - เพิ่ม/แก้การ์ด
```bash
node scripts/upsertCard.js
```

---

## ?? Migration Scripts (ใช้แล้ว)

- `migrateToDeckDB.js` - ย้ายข้อมูล Card  Deck DB
- `migrateCardNames.js` - อัพเดตชื่อการ์ด

---

## ?? API Endpoints

**อัพเดตการ์ดเดียว:**
```bash
POST /api/admin/update-image
{"cardName":"Star-Lord","imageUrl":"https://..."}
```

**อัพเดตหลายการ์ด:**
```bash
POST /api/admin/update-images-bulk
{"images":[{"cardName":"...","imageUrl":"..."}]}
```
