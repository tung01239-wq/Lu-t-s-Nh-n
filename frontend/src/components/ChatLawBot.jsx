import React, { useState, useRef, useEffect } from 'react'

export default function ChatLawBot({ apiUrl = '/api/chat' }){
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý pháp luật ảo. Nhập câu hỏi của bạn để bắt đầu.' }
  ])
  const [input, setInput] = useState('')
  const [jurisdiction, setJurisdiction] = useState('Vietnam')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(()=>{
    // Scroll to bottom
    if(boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight
  }, [messages])

  async function send(){
    if(!input.trim()) return
    const userMessage = { role: 'user', content: input }
    setMessages(m=>[...m, userMessage])
    const form = new FormData()
    form.append('message', input)
    form.append('jurisdiction', jurisdiction)
    if (fileRef.current?.files?.[0]) form.append('file', fileRef.current.files[0])

    setLoading(true)
    try {
      const res = await fetch(apiUrl, { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) {
        setMessages(m=>[...m, { role:'assistant', content: 'Lỗi: ' + (data.error || data.detail || 'Không rõ') }])
      } else {
        setMessages(m=>[...m, { role:'assistant', content: data.reply }])
      }
    } catch (err) {
      setMessages(m=>[...m, { role:'assistant', content: 'Lỗi kết nối máy chủ.' }])
    } finally {
      setLoading(false)
      setInput('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Chatbot AI — Tư vấn pháp luật</h1>
      <p className="text-sm text-gray-600 mb-4">Lưu ý: nội dung mang tính tham khảo. Không thay thế tư vấn pháp lý chuyên nghiệp.</p>

      <div className="mb-3">
        <label className="block text-sm">Jurisdiction / Quốc gia</label>
        <select value={jurisdiction} onChange={e=>setJurisdiction(e.target.value)} className="mt-1 p-2 border rounded w-full">
          <option>Vietnam</option>
          <option>United States</option>
          <option>Japan</option>
          <option>Other</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm">Đính kèm tài liệu (hợp đồng, ảnh, PDF)</label>
        <input ref={fileRef} type="file" className="mt-1" />
      </div>

      <div ref={boxRef} className="border rounded p-3 h-72 overflow-auto mb-3 bg-white">
        {messages.map((m,i)=> (
          <div key={i} className={`my-2 ${m.role==='user' ? 'text-right' : 'text-left'}`}> 
            <div className={`inline-block p-2 rounded ${m.role==='user' ? 'bg-blue-50' : 'bg-gray-100'}`}> 
              {m.content} 
            </div> 
          </div>
        ))} 
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nhập câu hỏi pháp lý của bạn..." className="flex-1 p-2 border rounded" />
        <button onClick={send} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Đang gửi...' : 'Gửi'}</button>
      </div>

      <p className="mt-3 text-xs text-gray-500">Gợi ý: mô tả rõ lĩnh vực (hôn nhân, lao động...), địa điểm & thời điểm để câu trả lời chính xác hơn.</p>
    </div>
  )
}