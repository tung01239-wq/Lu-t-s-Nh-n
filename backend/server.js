import express from 'express'
import multer from 'multer'
import fs from 'fs/promises'
import path from 'path'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()
const app = express()

// Use ESM-compatible multer temp storage
const uploadDir = path.resolve('./uploads')
await fs.mkdir(uploadDir, { recursive: true })
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(null, false)
  }
})

// Basic rate limiter
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 })
app.use(limiter)
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    const message = req.body.message || req.body.msg
    const jurisdiction = req.body.jurisdiction || 'Vietnam'
    if (!message) {
      // remove uploaded file if any
      if (req.file) await fs.rm(req.file.path, { force: true })
      return res.status(400).json({ error: 'Thiếu trường message' })
    }

    // NOTE: production: scan file for viruses & sensitive content here.
    let fileNote = ''
    if (req.file) {
      fileNote = ` (file đính kèm: ${req.file.originalname})`
      // Optionally: parse PDF or image text (pdf-parse, tesseract, etc.)
      // For now we do not read contents to avoid possible unsafe handling.
    }

    const systemPrompt = `Bạn là một trợ lý AI cung cấp thông tin pháp luật chung bằng tiếng Việt. Luôn bắt đầu bằng 1 câu từ chối trách nhiệm: "Tôi không phải là luật sư; thông tin dưới đây chỉ mang tính tham khảo."
Khi trả lời, hãy:
- Tóm tắt vấn đề trong 1 đoạn ngắn.
- Đưa ra các bước pháp lý khả thi (gạch đầu dòng).
- Liệt kê tài liệu cần chuẩn bị.
- Nếu cần tư vấn chuyên sâu (kiện tụng, xử lý hình sự, rủi ro lớn), yêu cầu liên hệ luật sư và không hướng dẫn thủ phạm làm trái pháp luật.
- Nếu thông tin không đủ, hỏi 2 câu cụ thể để làm rõ.`

    const userContent = `Jurisdiction: ${jurisdiction}. User question: ${message}${fileNote}`

    // Call OpenAI Chat Completions (REST) - using OPENAI_API_KEY in env
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      if (req.file) await fs.rm(req.file.path, { force: true })
      return res.status(500).json({ error: 'Server misconfigured: missing OPENAI_API_KEY' })
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini' // replace as you prefer
    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.1,
      max_tokens: 800
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!r.ok) {
      const errTxt = await r.text()
      console.error('OpenAI error', errTxt)
      if (req.file) await fs.rm(req.file.path, { force: true })
      return res.status(502).json({ error: 'Lỗi từ mô hình LLM', detail: errTxt })
    }

    const data = await r.json()
    const reply = (data.choices?.[0]?.message?.content) || 'Không có phản hồi từ mô hình.'

    // Clean up uploaded file (do not keep on disk)
    if (req.file) await fs.rm(req.file.path, { force: true })

    // Minimal logging (avoid logging user PII in production)
    console.log(`Chat request: ${jurisdiction} - ${message.slice(0, 120)}`)

    return res.json({ reply })
  } catch (err) {
    console.error(err)
    if (req.file) {
      try { await fs.rm(req.file.path, { force: true }) } catch {}
    }
    return res.status(500).json({ error: 'Server error', detail: err?.message })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server listening on ${port}`))
