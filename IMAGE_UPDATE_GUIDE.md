# Image URL Update Instructions

## วิธีการเพิ่มรูปภาพให้การ์ด

### Option A: ใช้ลิงก์จาก Wikia (แนะนำ)

1. **หา URL รูปการ์ดจาก Marvel Database Wiki:**
   - ไปที่ https://marvel.fandom.com/wiki/Category:Marvel_Duel_Card_Images
   - คลิกขวาที่รูป > Copy Image Address
   - ได้ลิงก์แบบ: `https://static.wikia.nocookie.net/marveldatabase/images/X/XX/Marvel_Duel_Card_XXXX.jpg`

2. **สร้างไฟล์ JSON mapping:**
   ```json
   {
     "Adam Warlock": "https://static.wikia.nocookie.net/marveldatabase/images/8/86/Marvel_Duel_Card_0013.jpg",
     "Groot (Young)": "https://static.wikia.nocookie.net/marveldatabase/images/1/13/Marvel_Duel_Card_0345.jpg"
   }
   ```

3. **Run update script:**
   ```bash
   cd server
   node scripts/updateImagesManual.js path/to/cardImages.json
   ```

### ตัวอย่างการใช้งาน:

```bash
# ทดสอบกับ sample data
node scripts/updateImagesManual.js scripts/sampleCardImages.json

# ใช้กับไฟล์จริง
node scripts/updateImagesManual.js ../cardImageUrls.json
```

### โครงสร้าง JSON ที่รองรับ:

```json
{
  "ชื่อการ์ดแบบเต็ม": "URL",
  "ชื่อการ์ดแบบสั้น": "URL"
}
```

Script จะค้นหาแบบ exact match และ partial match

### ตรวจสอบผลลัพธ์:

```bash
# เช็คว่ารูปถูก update แล้ว
curl http://localhost:5000/api/cards?search=Adam

# ผลลัพธ์จะมี "image": "https://static.wikia.nocookie.net/..."
```

## Files Created:

- `/server/scripts/updateImagesFromWikia.js` - Auto-generate URLs (ต้องมี card number)
- `/server/scripts/updateImagesManual.js` - Manual mapping (แนะนำ)
- `/server/scripts/sampleCardImages.json` - ตัวอย่าง

## API Changes:

- ✅ GET /api/cards - ส่ง `image` field จาก `image_url` ใน DB
- ✅ GET /api/cards/:id - ส่ง `image` field จาก `image_url` ใน DB
- ✅ Frontend CardModal - แสดงรูปจาก `card.image`
