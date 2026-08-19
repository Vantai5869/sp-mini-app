import { useState } from 'react';
import './App.css';

// Đổi mấy giá trị này, commit, push lên GitHub -> Vercel tự deploy lại
// -> mở app mobile lên, vào lại mini app này là thấy thay đổi ngay.
const ACCENT_COLOR = '#006af5';
const TITLE = 'SP Mini App';
const SUBTITLE = 'Sửa file src/App.tsx để đổi giao diện này';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="screen" style={{ '--accent': ACCENT_COLOR } as React.CSSProperties}>
      <div className="card">
        <span className="badge">Đã deploy lúc {new Date().toLocaleString('vi-VN')}</span>
        <h1>{TITLE}</h1>
        <p>{SUBTITLE}</p>
        <button className="counter" onClick={() => setCount((c) => c + 1)}>
          Đã bấm {count} lần
        </button>
      </div>
    </div>
  );
}

export default App;
