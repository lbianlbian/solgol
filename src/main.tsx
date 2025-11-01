import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// import { Buffer } from 'buffer';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in HTML');

const root = ReactDOM.createRoot(container);

root.render(
  <App />
);
