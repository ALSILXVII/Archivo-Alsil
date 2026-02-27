'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'Ciencia', 'Ingeniería', 'Política Nacional', 'Geopolítica',
  'Música', 'Fútbol', 'Arte', 'Cine', 'Cultura Pop', 'Tecnología', 'General',
];

type UploadedFile = {
  url: string;
  fileName: string;
  type: 'image' | 'video';
};

export default function CrearPostPage() {
  const [title, setTitle] = useState('');
  const [heading, setHeading] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState('article');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [cover, setCover] = useState('');
  const [featured, setFeatured] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [preview, setPreview] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Tag management
  const addTag = () => {
    const tag = tagsInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagsInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  // File upload
  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Error al subir archivo', type: 'error' });
        return null;
      }
      return { url: data.url, fileName: data.fileName, type: data.type };
    } catch {
      setMessage({ text: 'Error de red al subir archivo', type: 'error' });
      return null;
    }
  }, []);

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file);
    if (result) {
      setCover(result.url);
      setMessage({ text: 'Imagen de portada subida', type: 'success' });
    }
    setUploading(false);
  };

  // Media upload (images/videos for content)
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result) {
        setUploads(prev => [...prev, result]);
        // Insert markdown into content
        const textarea = contentRef.current;
        if (textarea) {
          const pos = textarea.selectionStart || content.length;
          const markdown = result.type === 'video'
            ? `\n<video src="${result.url}" controls class="w-full rounded-xl my-4"></video>\n`
            : `\n![${result.fileName}](${result.url})\n`;
          const newContent = content.slice(0, pos) + markdown + content.slice(pos);
          setContent(newContent);
        }
      }
    }
    setUploading(false);
    setMessage({ text: `${files.length} archivo(s) subido(s)`, type: 'success' });
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  // Insert media from gallery
  const insertMedia = (file: UploadedFile) => {
    const textarea = contentRef.current;
    const pos = textarea?.selectionStart || content.length;
    const markdown = file.type === 'video'
      ? `\n<video src="${file.url}" controls class="w-full rounded-xl my-4"></video>\n`
      : `\n![${file.fileName}](${file.url})\n`;
    const newContent = content.slice(0, pos) + markdown + content.slice(pos);
    setContent(newContent);
  };

  // Save post
  const handleSave = async () => {
    if (!title.trim()) {
      setMessage({ text: 'El título es requerido', type: 'error' });
      return;
    }
    if (!content.trim()) {
      setMessage({ text: 'El contenido es requerido', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          heading: heading.trim() || title.trim(),
          date: new Date().toISOString().split('T')[0],
          category: category.toLowerCase(),
          tags,
          type,
          excerpt: excerpt.trim(),
          cover,
          featured,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Error al guardar', type: 'error' });
      } else {
        setMessage({ text: `Post creado exitosamente. Slug: ${data.slug}`, type: 'success' });
        // Reset form
        setTitle('');
        setHeading('');
        setCategory('General');
        setTags([]);
        setTagsInput('');
        setType('article');
        setExcerpt('');
        setContent('');
        setCover('');
        setFeatured(false);
        setUploads([]);
      }
    } catch {
      setMessage({ text: 'Error de red al guardar', type: 'error' });
    }
    setSaving(false);
  };

  // Simple markdown to HTML for preview
  const renderPreview = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 max-w-full" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-amber-400 underline">$1</a>')
      .replace(/(<video[\s\S]*?<\/video>)/g, '$1')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>');
    html = `<p class="mb-3">${html}</p>`;
    return html;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg sm:text-xl font-semibold tracking-widest font-serif text-zinc-100">
            Archivo ALSIL
          </Link>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button
              onClick={() => setPreview(!preview)}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-sm"
            >
              {preview ? 'Editar' : 'Vista previa'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Publicar'}
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`max-w-6xl mx-auto mt-4 px-6`}>
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-800' : 'bg-red-900/40 text-red-300 border border-red-800'}`}>
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title */}
          <input
            type="text"
            placeholder="Título del post..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-zinc-600 text-zinc-100"
          />

          {/* Heading */}
          <input
            type="text"
            placeholder="Encabezado (opcional, se usa como H1 en el post)..."
            value={heading}
            onChange={e => setHeading(e.target.value)}
            className="w-full text-xl bg-transparent border-none outline-none placeholder-zinc-600 text-zinc-300"
          />

          {/* Excerpt */}
          <textarea
            placeholder="Extracto / resumen breve del post..."
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-600 resize-none"
          />

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Imagen de portada</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition text-sm"
              >
                {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              {cover && (
                <div className="flex items-center gap-2">
                  <img src={cover} alt="Cover preview" className="h-12 w-20 object-cover rounded border border-zinc-700" />
                  <button onClick={() => setCover('')} className="text-red-400 text-xs hover:text-red-300">Quitar</button>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor / Preview */}
          {preview ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[400px]">
              <div className="prose prose-invert max-w-none">
                {cover && <img src={cover} alt="Cover" className="w-full rounded-xl mb-6" />}
                <h1 className="text-3xl font-bold mb-2">{heading || title || 'Sin título'}</h1>
                <p className="text-sm text-zinc-500 mb-6">{new Date().toISOString().split('T')[0]} · {category}</p>
                {tags.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {tags.map(tag => (
                      <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const selected = content.slice(start, end);
                    const newContent = content.slice(0, start) + `**${selected || 'texto en negrita'}**` + content.slice(end);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm font-bold"
                  title="Negrita"
                >
                  B
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const end = ta.selectionEnd;
                    const selected = content.slice(start, end);
                    const newContent = content.slice(0, start) + `*${selected || 'texto en cursiva'}*` + content.slice(end);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm italic"
                  title="Cursiva"
                >
                  I
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart;
                    const newContent = content.slice(0, pos) + '\n## Encabezado\n' + content.slice(pos);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Encabezado H2"
                >
                  H2
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart;
                    const newContent = content.slice(0, pos) + '\n### Subencabezado\n' + content.slice(pos);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Encabezado H3"
                >
                  H3
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart;
                    const newContent = content.slice(0, pos) + '\n[texto del enlace](https://url)\n' + content.slice(pos);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Enlace"
                >
                  Link
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart;
                    const newContent = content.slice(0, pos) + '\n> Cita aquí\n' + content.slice(pos);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Cita"
                >
                  &ldquo; &rdquo;
                </button>
                <button
                  onClick={() => {
                    const ta = contentRef.current;
                    if (!ta) return;
                    const pos = ta.selectionStart;
                    const newContent = content.slice(0, pos) + '\n- Elemento de lista\n' + content.slice(pos);
                    setContent(newContent);
                  }}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Lista"
                >
                  Lista
                </button>
                <div className="border-l border-zinc-700 mx-1" />
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
                  title="Subir imagen o video"
                >
                  {uploading ? '⏳' : '📷 Imagen / Video'}
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                />
              </div>

              {/* Textarea */}
              <textarea
                ref={contentRef}
                placeholder="Escribe el contenido de tu post en Markdown...&#10;&#10;Puedes usar:&#10;# Encabezado&#10;**negrita** *cursiva*&#10;![imagen](url)&#10;[enlace](url)"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={20}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 resize-y font-mono leading-relaxed"
              />
            </div>
          )}

          {/* Uploaded Media Gallery */}
          {uploads.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Archivos subidos</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {uploads.map((file, i) => (
                  <div
                    key={i}
                    className="relative group cursor-pointer border border-zinc-800 rounded-lg overflow-hidden hover:border-amber-500/50 transition"
                    onClick={() => insertMedia(file)}
                    title="Click para insertar en el contenido"
                  >
                    {file.type === 'video' ? (
                      <div className="bg-zinc-900 h-20 flex items-center justify-center text-zinc-500 text-2xl">🎬</div>
                    ) : (
                      <img src={file.url} alt={file.fileName} className="w-full h-20 object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs text-zinc-300">
                      Insertar
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Metadata */}
        <aside className="w-full lg:w-72 space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Categoría</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Etiquetas</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-red-400 ml-1">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Agregar etiqueta..."
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-600"
              />
              <button onClick={addTag} className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm">+</button>
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
            >
              <option value="article">Artículo</option>
              <option value="analysis">Análisis</option>
              <option value="opinion">Opinión</option>
              <option value="review">Reseña</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-amber-500"
            />
            <label htmlFor="featured" className="text-sm text-zinc-400">Destacado</label>
          </div>

          {/* Stats */}
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <div className="text-xs text-zinc-500">
              <span className="font-semibold">Palabras:</span> {content.split(/\s+/).filter(Boolean).length}
            </div>
            <div className="text-xs text-zinc-500">
              <span className="font-semibold">Caracteres:</span> {content.length}
            </div>
            <div className="text-xs text-zinc-500">
              <span className="font-semibold">Imágenes/Videos:</span> {uploads.length}
            </div>
          </div>

          {/* Quick Help */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Markdown</div>
            <div className="text-xs text-zinc-600 space-y-1 font-mono">
              <div># Encabezado 1</div>
              <div>## Encabezado 2</div>
              <div>**negrita**</div>
              <div>*cursiva*</div>
              <div>![alt](url)</div>
              <div>[texto](url)</div>
              <div>&gt; cita</div>
              <div>- lista</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
