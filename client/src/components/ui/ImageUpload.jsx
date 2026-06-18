import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPT = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] };

export default function ImageUpload({ value, onChange, label = 'Image', maxFiles = 1, multiple = false }) {
  const [preview, setPreview] = useState(value || null);
  const [previews, setPreviews] = useState(Array.isArray(value) ? value : []);

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    if (multiple) {
      const urls = accepted.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
      onChange(accepted);
    } else {
      setPreview(URL.createObjectURL(accepted[0]));
      onChange(accepted[0]);
    }
  }, [multiple, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPT, maxFiles: multiple ? maxFiles : 1, multiple,
  });

  const remove = (i) => {
    if (multiple) {
      const next = previews.filter((_, idx) => idx !== i);
      setPreviews(next);
      onChange(null);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const zone = {
    border: `2px dashed ${isDragActive ? 'var(--esp-primary)' : 'var(--esp-border)'}`,
    borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer',
    background: isDragActive ? 'rgba(79,70,229,0.04)' : 'transparent', transition: 'all 0.2s',
  };

  if (multiple) {
    return (
      <div>
        {label && <label className="form-label">{label}</label>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--esp-border)' }} />
              <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--esp-danger)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, lineHeight: '18px', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
        <div {...getRootProps()} style={zone}>
          <input {...getInputProps()} />
          <span style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>
            {isDragActive ? 'Drop images here…' : 'Drag & drop or click to upload'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      {preview ? (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          <img src={preview} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--esp-border)', display: 'block' }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => remove()}>Remove</button>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <button type="button" className="btn btn-secondary btn-sm">Replace</button>
            </div>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} style={zone}>
          <input {...getInputProps()} />
          <div style={{ color: 'var(--esp-text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📷</div>
            {isDragActive ? 'Drop image here…' : 'Drag & drop or click to upload'}
            <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG, WEBP · max 5MB</div>
          </div>
        </div>
      )}
    </div>
  );
}
