# API Conventions

## ✅ Response Format

**Success**

```json
{ "success": true, "data": [...], "meta": { "page": 1, "total": 3 } }
Error

json
Sao chép mã
{ "success": false, "error": { "message": "Invalid request", "code": "INVALID_BODY" } }
🔢 Pagination
Params: page, perPage

Default: 1 / 20

Response meta: { page, perPage, total, totalPages }

⚙️ Status Codes
Code	Meaning
200	OK
400	Invalid body
401	Unauthorized
404	Not found
500	Internal error

🧩 Example Endpoint
GET /api/products?page=1&perPage=10
returns:

json
Sao chép mã
{
  "success": true,
  "data": [ { "id": 1, "title": "Sofa Da Cao Cấp", "images": [...] } ],
  "meta": { "page": 1, "perPage": 10, "total": 3, "totalPages": 1 }
}
```
