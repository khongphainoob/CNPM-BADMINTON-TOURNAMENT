import { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { useStore } from '../../data/store'

type Props = {
  onClose: () => void
  onSave: (article: any) => void
}

export default function ArticleEditor({ onClose, onSave }: Props) {
  const { currentUser } = useStore()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)

  // Auto-generate slug from title
  useEffect(() => {
    if (!title) { setSlug(''); return }
    const generated = title.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generated)
  }, [title])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(/^#/, '')
      if (val && !tags.includes(val) && tags.length < 10) {
        setTags([...tags, val])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent, submitStatus: string) => {
    e.preventDefault()
    if (!title.trim()) return alert('Vui lòng nhập tiêu đề bài viết!')
    if (!content.trim()) return alert('Nội dung không được để trống!')
    
    onSave({
      title, slug, content, tags, status: submitStatus,
      thumbnailName: thumbnail?.name,
      author: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString()
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Soạn thảo Bài viết (BM5)</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Trình soạn thảo nội dung CMS · Tự động lưu nháp</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Huỷ</button>
          <button type="button" onClick={(e) => handleSubmit(e, 'draft')} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Lưu nháp
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, 'published')} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--ink)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Xuất bản ngay
          </button>
        </div>
      </div>
      
      {/* Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Area */}
        <div style={{ flex: 1, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="scrollbar">
          <div style={{ padding: '40px 60px', maxWidth: 800, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              style={{ 
                fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: 'var(--ink)', 
                border: 'none', outline: 'none', width: '100%', background: 'transparent'
              }}
            />

            {/* Fake Rich Text Toolbar */}
            <div style={{ display: 'flex', gap: 4, padding: '8px', background: 'var(--paper-2)', borderRadius: 8, border: '1px solid var(--line)' }}>
              {['bold', 'italic', 'underline', 'link', 'image', 'list', 'align-left', 'align-center', 'align-right'].map(icon => (
                <button key={icon} style={{ padding: '6px', background: 'transparent', border: 'none', borderRadius: 4, color: 'var(--ink-2)', cursor: 'pointer' }}>
                  <Icon name={icon} size={16} />
                </button>
              ))}
            </div>

            <textarea 
              value={content} onChange={e => setContent(e.target.value)}
              placeholder="Nội dung bài viết... (Sử dụng Markdown hoặc Rich Text)"
              style={{
                fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.6, color: 'var(--ink)',
                border: 'none', outline: 'none', width: '100%', minHeight: 400, resize: 'none', background: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div style={{ width: 320, background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="scrollbar">
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Đường dẫn (Slug)</label>
              <input 
                value={slug} onChange={e => setSlug(e.target.value)}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, outline: 'none', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Ảnh đại diện (Thumbnail)</label>
              <div style={{ 
                border: '1.5px dashed var(--line)', borderRadius: 8, padding: '24px', textAlign: 'center', 
                cursor: 'pointer', background: 'var(--paper)', position: 'relative', overflow: 'hidden'
              }}>
                {thumbnail ? (
                  <img src={URL.createObjectURL(thumbnail)} alt="thumb" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Icon name="image" size={24} style={{ color: 'var(--ink-3)', marginBottom: 8 }} />
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Tải ảnh lên (16:9)</div>
                  </>
                )}
                <input 
                  type="file" accept="image/*" 
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={e => e.target.files && setThumbnail(e.target.files[0])}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Thẻ phân loại (Tags)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                {tags.map(t => (
                  <span key={t} style={{ padding: '4px 8px', background: 'var(--ink)', color: 'white', borderRadius: 4, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    #{t} <Icon name="x" size={10} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(t)} />
                  </span>
                ))}
              </div>
              <input 
                value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                placeholder={tags.length < 10 ? "Nhập tag và Enter..." : "Tối đa 10 tags"}
                disabled={tags.length >= 10}
                style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--paper)', fontSize: 13, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Tác giả</label>
              <div style={{ padding: '10px 12px', borderRadius: 6, background: 'var(--line-2)', fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
                {currentUser?.name || 'Admin'}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
