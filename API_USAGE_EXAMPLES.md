# API Usage Examples - Card Image by Number

## 🎯 แนวคิด
แทนที่จะเก็บ URL รูปใน Database เราจะ:
1. **เก็บแค่ `card_number`** ใน Database (เช่น "0645", "0001", "0013")
2. **Backend API จะค้นหา URL** จาก Fandom Wiki โดยอัตโนมัติ
3. **มี Cache 24 ชั่วโมง** เพื่อลดการเรียก API

---

## 📡 Backend API

### Endpoint: Get Card Image by Number
```
GET /api/images/card/:cardNumber
```

**ตัวอย่าง:**
```bash
# ดึงรูป Groot (Young) - card number 0645
GET http://localhost:5000/api/images/card/0645

# Response:
{
  "cardNumber": "0645",
  "imageUrl": "https://static.wikia.nocookie.net/marveldatabase/images/8/86/Marvel_Duel_Card_0645.jpg",
  "cached": false
}
```

**การใช้งาน:**
- ✅ `card_number` ต้องเป็นตัวเลข 4 หลัก (0001, 0645, 0013)
- ✅ ถ้ามีใน cache จะ return ทันที (cached: true)
- ✅ ถ้าไม่มี จะค้นหาจาก Fandom API
- ❌ ถ้าหาไม่เจอ return 404

---

## 💻 Frontend Usage

### วิธีที่ 1: ใช้ Helper Function (แนะนำ)

```typescript
import { getCardImageUrlByNumber } from '@/utils/imageHelpers';

// Card object จาก Database
const card = {
  record_id: 1,
  card_number: "0645",
  display_name: "Groot (Young) - Guardians of the Galaxy",
  base_card_name: "Groot (Young)"
};

// ดึง image URL อัตโนมัติ (รองรับทั้ง card_number และ image_url legacy)
const imageUrl = await getCardImageUrlByNumber(card);
// Returns: proxied URL ที่พร้อมใช้งาน
```

### วิธีที่ 2: ใช้ API โดยตรง

```typescript
// ดึง URL จาก card_number
const response = await fetch(`http://localhost:5000/api/images/card/0645`);
const data = await response.json();
console.log(data.imageUrl);
// "https://static.wikia.nocookie.net/marveldatabase/images/8/86/Marvel_Duel_Card_0645.jpg"
```

### วิธีที่ 3: ใช้ใน React Component

```tsx
import { useState, useEffect } from 'react';
import { getProxiedCardImageByNumber } from '@/utils/imageHelpers';

function CardImage({ cardNumber }: { cardNumber: string }) {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImage() {
      setLoading(true);
      const url = await getProxiedCardImageByNumber(cardNumber);
      setImageUrl(url || '/placeholder-card.png');
      setLoading(false);
    }
    loadImage();
  }, [cardNumber]);

  if (loading) return <div>Loading...</div>;
  
  return <img src={imageUrl} alt={`Card ${cardNumber}`} />;
}

// การใช้งาน:
<CardImage cardNumber="0645" />
```

---

## 🔄 Migration Guide

### ขั้นตอนการย้ายจากระบบเก่า (image_url) มาใช้ระบบใหม่ (card_number)

#### 1. เพิ่ม `card_number` ให้กับ Card ทั้งหมด

```javascript
// ใช้ script addCardNumbers.js ที่มีอยู่แล้ว
node scripts/addCardNumbers.js

// หรือ update ใน MongoDB Shell:
db.GuardiansoftheGalaxy.updateOne(
  { "records.base_card_name": "Groot (Young)" },
  { $set: { "records.$.card_number": "0645" } }
)
```

#### 2. Update Frontend Components

**เดิม (ใช้ image_url):**
```tsx
<img src={getCardImageUrl(card)} alt={card.display_name} />
```

**ใหม่ (ใช้ card_number):**
```tsx
const imageUrl = await getCardImageUrlByNumber(card);
<img src={imageUrl} alt={card.display_name} />
```

#### 3. ลบ `image_url` ออกจาก Database (Optional)

```javascript
// หลังจากที่ระบบใหม่ทำงานได้แล้ว สามารถลบ field เก่าได้
db.GuardiansoftheGalaxy.updateMany(
  {},
  { 
    $unset: { 
      "records.$[].image_url": "",
      "records.$[].image_file": ""
    }
  }
)
```

---

## ⚡ Performance & Caching

### Backend Cache
- **Cache Duration:** 24 hours
- **Storage:** In-memory (Map)
- **Automatic:** ไม่ต้องทำอะไรเพิ่ม

### Frontend Cache (Recommended)
```typescript
// สร้าง cache layer ที่ frontend
const imageCache = new Map<string, string>();

async function getCachedCardImage(cardNumber: string): Promise<string> {
  if (imageCache.has(cardNumber)) {
    return imageCache.get(cardNumber)!;
  }
  
  const url = await getProxiedCardImageByNumber(cardNumber);
  imageCache.set(cardNumber, url);
  return url;
}
```

---

## 🧪 Testing

### Test API Endpoint
```bash
# Test card 0645 (Groot Young)
curl http://localhost:5000/api/images/card/0645

# Test card 0001 (Groot)
curl http://localhost:5000/api/images/card/0001

# Test invalid card number
curl http://localhost:5000/api/images/card/9999
# Expected: 404 Not Found

# Test invalid format
curl http://localhost:5000/api/images/card/abc
# Expected: 400 Bad Request
```

---

## 📊 Database Schema

### ตัวอย่าง Card Document (แบบใหม่)

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "deck_name": "Guardians of the Galaxy",
  "records": [
    {
      "record_id": 1,
      "card_id": "GOTG-001",
      "card_number": "0645",          // ⭐ ใช้ตัวนี้แทน image_url
      "display_name": "Groot (Young) - Guardians of the Galaxy",
      "base_card_name": "Groot (Young)",
      "faction": "Guardians of the Galaxy",
      // ไม่ต้องมี image_url และ image_file อีกต่อไป
      "availability_status": "available",
      "patch_version": "2026-03-13"
    }
  ]
}
```

---

## ✅ ข้อดีของวิธีนี้

1. **ประหยัดพื้นที่ DB** - ไม่เก็บ URL ยาวๆ (ลดจาก ~150 ตัวอักษร เหลือ 4 ตัวอักษร)
2. **Flexible** - ถ้า Fandom เปลี่ยน URL format แค่แก้ที่ API
3. **Auto-update** - ถ้า Fandom อัพเดตรูป เราจะได้รูปใหม่อัตโนมัติ
4. **Caching** - ลดการเรียก API ซ้ำๆ ด้วย cache 24 ชั่วโมง
5. **Backward Compatible** - ยังรองรับ `image_url` แบบเก่าได้

---

## 🎯 Next Steps

1. ✅ เพิ่ม `card_number` ให้ครบทุก card ใน Database
2. ✅ Update Frontend components ให้ใช้ `getCardImageUrlByNumber()`
3. ✅ Test ทุก card ว่ารูปขึ้นถูกต้อง
4. ⏳ ลบ `image_url` ออกจาก Database (Optional)
5. ⏳ Add monitoring/logging สำหรับ API calls

---

## 🐛 Troubleshooting

### รูปไม่ขึ้น / 404 Error
- ตรวจสอบ `card_number` ว่าถูกต้อง (ต้องเป็น 4 หลัก)
- ตรวจสอบว่ารูปมีจริงใน Fandom: `https://marvel.fandom.com/wiki/File:Marvel_Duel_Card_0645.jpg`
- ลอง clear cache: restart backend server

### API ช้า
- ครั้งแรกจะช้าเพราะต้องค้นหาจาก Fandom
- ครั้งต่อไปจะเร็วขึ้นเพราะมี cache
- ถ้ายังช้า ลอง pre-load รูปตอน app start

### Card Number ไม่มี
- รัน `node scripts/addCardNumbers.js` เพื่อดึง card_number จาก image_url ที่มีอยู่
- หรือ manually เพิ่มใน Database
