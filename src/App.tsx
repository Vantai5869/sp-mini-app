import { useEffect, useState } from 'react';
import './App.css';
import type { OpenCameraResult } from './miniapp';

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
  const [applying, setApplying] = useState(false);
  const [bridgeMsg, setBridgeMsg] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraMsg, setCameraMsg] = useState<string | null>(null);
  const inHost = typeof window !== 'undefined' && !!window.MiniApp;

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

  // Mini-app -> host-app interaction demo: asks the native side (see
  // MiniAppShell's handleRequest -> 'updateHostTile') to restyle this mini
  // app's own tile on the Home/Services screens underneath, live, using
  // whatever title/color is currently shown on this card.
  async function applyToHost() {
    if (!state || !window.MiniApp) return;
    setApplying(true);
    setBridgeMsg(null);
    try {
      await window.MiniApp.ready();
      await window.MiniApp.call('updateHostTile', { color: state.accentColor, label: state.title });
      setBridgeMsg('Đã gửi — đóng mini app để thấy icon đổi.');
    } catch (e) {
      setBridgeMsg('Lỗi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setApplying(false);
    }
  }

  // Demo of a second host interface: MiniApp.call('openCamera') opens the
  // supper-app's real native camera (not a WebView getUserMedia preview)
  // and hands back the captured photo — see MiniAppShell.tsx's handleRequest
  // there for the native side.
  async function openCamera() {
    if (!window.MiniApp) return;
    setCapturing(true);
    setCameraMsg(null);
    try {
      await window.MiniApp.ready();
      const result = (await window.MiniApp.call('openCamera')) as OpenCameraResult;
      if (result.cancelled) {
        setCameraMsg('Đã huỷ chụp ảnh.');
      } else {
        setPhoto(result.base64 ? `data:image/jpeg;base64,${result.base64}` : result.uri ?? null);
      }
    } catch (e) {
      setCameraMsg('Lỗi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setCapturing(false);
    }
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

        {!editing && (
          <div className="bridge">
            <p className="bridge-label">Demo tương tác với app gốc</p>
            <button className="btn outline" onClick={applyToHost} disabled={!inHost || applying}>
              {applying ? 'Đang gửi…' : 'Đổi icon app gốc theo card này'}
            </button>
            {!inHost && <p className="bridge-msg">Chỉ hoạt động khi mở trong supper app</p>}
            {bridgeMsg && <p className="bridge-msg">{bridgeMsg}</p>}

            <p className="bridge-label" style={{ marginTop: 18 }}>
              Interface: Mở camera
            </p>
            {photo && <img src={photo} alt="Ảnh vừa chụp" className="camera-preview" />}
            <button className="btn outline" onClick={openCamera} disabled={!inHost || capturing}>
              {capturing ? 'Đang mở camera…' : photo ? 'Chụp lại' : 'Mở camera'}
            </button>
            {!inHost && <p className="bridge-msg">Chỉ hoạt động khi mở trong supper app</p>}
            {cameraMsg && <p className="bridge-msg">{cameraMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
