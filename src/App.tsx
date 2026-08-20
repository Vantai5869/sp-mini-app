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
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="screen" style={{ '--accent': state.accentColor } as React.CSSProperties}>
      <div className="card">
        <span className="badge">Tải từ server lúc {new Date().toLocaleTimeString('vi-VN')}</span>
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
              <input
                type="color"
                value={draft.accentColor}
                onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
              />
            </label>
            <div className="row">
              <button className="counter ghost" onClick={() => { setDraft(state); setEditing(false); }}>
                Huỷ
              </button>
              <button className="counter" onClick={save} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        ) : (
          <button className="counter" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </button>
        )}

        <p className="hint">
          Sửa ở đây trên trình duyệt → Lưu → mở lại mini app trong supper app (kéo để reload) là thấy thay
          đổi ngay, không cần deploy lại.
        </p>
      </div>
    </div>
  );
}

export default App;
