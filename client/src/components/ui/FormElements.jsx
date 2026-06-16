import { forwardRef } from 'react';

export function Button({ children, variant = 'primary', size, loading, className = '', ...props }) {
  const cls = `btn btn-${variant}${size ? ` btn-${size}` : ''} ${className}`;
  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading ? '…' : children}
    </button>
  );
}

export const Input = forwardRef(function Input({ error, className = '', ...props }, ref) {
  return (
    <>
      <input ref={ref} className={`input${error ? ' input-error' : ''} ${className}`} {...props} />
      {error && <p className="field-error">{error}</p>}
    </>
  );
});

export const Select = forwardRef(function Select({ error, children, className = '', ...props }, ref) {
  return (
    <>
      <select ref={ref} className={`select-field${error ? ' input-error' : ''} ${className}`} {...props}>{children}</select>
      {error && <p className="field-error">{error}</p>}
    </>
  );
});

export const Textarea = forwardRef(function Textarea({ error, className = '', ...props }, ref) {
  return (
    <>
      <textarea ref={ref} className={`textarea-field${error ? ' input-error' : ''} ${className}`} rows={4} {...props} />
      {error && <p className="field-error">{error}</p>}
    </>
  );
});
