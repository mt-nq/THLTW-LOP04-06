import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { store } from './store';
import App from './App';
import './index.css';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#6366f1',
              colorSuccess: '#10b981',
              colorWarning: '#f59e0b',
              colorError: '#ef4444',
              colorInfo: '#3b82f6',
              borderRadius: 10,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 14,
            },
            components: {
              Layout: {
                siderBg: '#1e1b4b',
                triggerBg: '#312e81',
              },
              Menu: {
                darkItemBg: '#1e1b4b',
                darkItemSelectedBg: '#4f46e5',
                darkItemHoverBg: '#312e81',
              },
            },
          }}
        >
          <AntApp>
            <App />
          </AntApp>
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
