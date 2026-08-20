import { useEffect, useState } from 'react';
import './App.css';

type MiniAppState = {
  title: string;
  subtitle: string;
  accentColor: string;
};

function App() {
  const [state, setState] = useState<MiniAppState | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MiniAppState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((data: MiniAppState) => {
        setState(data);
        setDraft(data);
      });
  }, []);

  async function save() {
    if (!draft) return;
    setSaving(true);
    await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setState(draft);
    setSaving(false);
    setEditing(false);
  }

  if (!state || !draft) {
    return (
      <div className="screen">
        <div className="card">
          <div className="skel skel-avatar" />
          <div className="skel skel-badge" />
          <div className="skel skel-title" />
          <div className="skel skel-line" />
          <div className="skel skel-line short" />
          <div className="skel skel-button" />
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ '--accent': state.accentColor } as React.CSSProperties}>
      <div className="card">
        <div className="glow" />

        <div className="avatar">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M13 2 L4 14 h6 l-1 8 9-12h-6z" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>

        <span className="badge">
          <span className="dot" />
          Live · cập nhật {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>

        <h1>{state.title}</h1>
        <p>{state.subtitle}</p>

        {editing ? (
          <div className="form">
            <label>
              Tiêu đề
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              Mô tả
              <textarea
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </label>
            <label>
              Màu chủ đạo
              <div className="color-row">
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
                />
                <span className="color-value">{draft.accentColor}</span>
              </div>
            </label>
            <div className="row">
              <button
                className="btn ghost"
                onClick={() => {
                  setDraft(state);
                  setEditing(false);
                }}>
                Huỷ
              </button>
              <button className="btn primary" onClick={save} disabled={saving}>
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn primary" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </button>
        )}

        <p className="hint">
          Sửa ở đây → Lưu → mở lại mini app trong supper app (kéo xuống hoặc bấm nút refresh) là thấy thay
          đổi ngay, không cần deploy lại.
        </p>
      </div>
    </div>
  );
}

export default App;
