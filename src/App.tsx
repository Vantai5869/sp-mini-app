import { useEffect, useRef, useState } from 'react';
import './App.css';
import type { OpenCameraResult } from './miniapp';

type MiniAppState = {
  title: string;
  subtitle: string;
  accentColor: string;
};

const ICONS = {
  bolt: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2 L4 14 h6 l-1 8 9-12h-6z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 2a10 10 0 1 0 0 20c1.5 0 2-1 2-2s-.5-1.2-.5-2 .8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-5-4.5-10.5-9-10.5Z"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M9.5 14.5 14.5 9.5M8 17 5.5 19.5a3 3 0 1 1-4-4L4 13m12-2 2.5-2.5a3 3 0 1 0-4-4L12 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const DEMO_LINK_URL = 'https://expo.dev';

function App() {
  const [state, setState] = useState<MiniAppState | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MiniAppState | null>(null);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [bridgeMsg, setBridgeMsg] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraResult, setCameraResult] = useState<OpenCameraResult | null>(null);
  const [cameraMsg, setCameraMsg] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [linkMsg, setLinkMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const inHost = typeof window !== 'undefined' && !!window.MiniApp;
  const fetchedOnce = useRef(false);

  useEffect(() => {
    fetch('/api/state')
      .then((r) => r.json())
      .then((data: MiniAppState) => {
        setState(data);
        setDraft(data);
        fetchedOnce.current = true;
        setNow(Date.now());
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
    setNow(Date.now());
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
        setCameraResult(result);
        setSaveMsg(null);
        setCameraMsg(null);
      }
    } catch (e) {
      setCameraMsg('Lỗi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setCapturing(false);
    }
  }

  // Demo of a third host interface: MiniApp.call('saveImage') persists the
  // photo just captured above into the device's photo library — reuses the
  // native `uri` openCamera returned rather than re-encoding the base64.
  async function saveImage() {
    if (!window.MiniApp || !cameraResult?.uri) return;
    setSavingImage(true);
    setSaveMsg(null);
    try {
      await window.MiniApp.ready();
      await window.MiniApp.call('saveImage', { uri: cameraResult.uri });
      setSaveMsg('Đã lưu vào thư viện ảnh.');
    } catch (e) {
      setSaveMsg('Lỗi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSavingImage(false);
    }
  }

  // Demo of a fourth host interface: MiniApp.call('openLink') opens an
  // external http(s) URL through the host's system browser.
  async function openLink() {
    if (!window.MiniApp) return;
    setOpening(true);
    setLinkMsg(null);
    try {
      await window.MiniApp.ready();
      await window.MiniApp.call('openLink', { url: DEMO_LINK_URL });
    } catch (e) {
      setLinkMsg('Lỗi: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setOpening(false);
    }
  }

  if (!state || !draft) {
    return (
      <div className="app">
        <header className="topbar">
          <div className="topbar-icon skel skel-round" />
          <div className="skel skel-topbar-title" />
        </header>
        <main className="content">
          <section className="hero">
            <div className="skel skel-hero-title" />
            <div className="skel skel-hero-line" />
          </section>
          <section className="section">
            <div className="skel skel-section-title" />
            <div className="list">
              <div className="row row-skel">
                <div className="skel skel-row-icon" />
                <div className="row-body">
                  <div className="skel skel-row-title" />
                  <div className="skel skel-row-desc" />
                </div>
              </div>
              <div className="row row-skel">
                <div className="skel skel-row-icon" />
                <div className="row-body">
                  <div className="skel skel-row-title" />
                  <div className="skel skel-row-desc" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app" style={{ '--accent': state.accentColor } as React.CSSProperties}>
      <header className="topbar">
        <span className="topbar-icon">{ICONS.bolt}</span>
        <span className="topbar-title">Mini App Demo</span>
        <span className="live">
          <span className="live-dot" />
          Live
        </span>
      </header>

      <main className="content">
        <section className="hero">
          <div className="hero-row">
            <div className="hero-text">
              <h1>{state.title}</h1>
              <p>{state.subtitle}</p>
            </div>
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label="Chỉnh sửa nội dung">
              {ICONS.pencil}
            </button>
          </div>
          <p className="hero-meta">
            Cập nhật lúc {new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">SDK Demo · Interface từ supper-app</h2>
          <div className="list">
            <div className="row">
              <div className="row-icon">{ICONS.palette}</div>
              <div className="row-body">
                <div className="row-title">Cập nhật tile app gốc</div>
                <div className="row-desc">Đổi màu/tên icon của mini app này trên màn hình chính, ngay khi đang mở.</div>
                {bridgeMsg && <div className="row-status">{bridgeMsg}</div>}
              </div>
              <button className="row-action" onClick={applyToHost} disabled={!inHost || applying}>
                {applying ? '…' : 'Áp dụng'}
              </button>
            </div>

            <div className="row">
              <div className="row-icon">{ICONS.camera}</div>
              <div className="row-body">
                <div className="row-title">Mở camera</div>
                <div className="row-desc">Mở camera native của supper-app để chụp ảnh.</div>
                {cameraResult && (
                  <img
                    src={
                      cameraResult.base64
                        ? `data:image/jpeg;base64,${cameraResult.base64}`
                        : cameraResult.uri
                    }
                    alt="Ảnh vừa chụp"
                    className="row-photo"
                  />
                )}
                {cameraMsg && <div className="row-status">{cameraMsg}</div>}
              </div>
              <button className="row-action" onClick={openCamera} disabled={!inHost || capturing}>
                {capturing ? '…' : cameraResult ? 'Chụp lại' : 'Mở'}
              </button>
            </div>

            <div className="row">
              <div className="row-icon">{ICONS.download}</div>
              <div className="row-body">
                <div className="row-title">Lưu ảnh</div>
                <div className="row-desc">Lưu ảnh vừa chụp ở trên vào thư viện ảnh của máy.</div>
                {saveMsg && <div className="row-status">{saveMsg}</div>}
              </div>
              <button
                className="row-action"
                onClick={saveImage}
                disabled={!inHost || !cameraResult?.uri || savingImage}>
                {savingImage ? '…' : 'Lưu'}
              </button>
            </div>

            <div className="row">
              <div className="row-icon">{ICONS.link}</div>
              <div className="row-body">
                <div className="row-title">Mở link</div>
                <div className="row-desc">Mở {DEMO_LINK_URL} bằng trình duyệt hệ thống.</div>
                {linkMsg && <div className="row-status">{linkMsg}</div>}
              </div>
              <button className="row-action" onClick={openLink} disabled={!inHost || opening}>
                {opening ? '…' : 'Mở'}
              </button>
            </div>
          </div>
          {!inHost && <p className="hint">Các interface trên chỉ hoạt động khi mở trong supper app.</p>}
        </section>

        <p className="hint">
          Sửa nội dung ở đây → Lưu → mở lại mini app trong supper app (kéo xuống hoặc bấm nút refresh) là
          thấy thay đổi ngay, không cần deploy lại.
        </p>
      </main>

      {editing && (
        <div className="sheet-backdrop" onClick={() => setEditing(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Chỉnh sửa nội dung</h3>
              <button className="icon-btn" onClick={() => setEditing(false)} aria-label="Đóng">
                {ICONS.close}
              </button>
            </div>
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
              <div className="row buttons">
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
