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
import { theme } from 'antd';

dayjs.locale('vi');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider
          locale={viVN}
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#e50914',
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
                siderBg: '#121212',
                triggerBg: '#1a1a1a',
                bodyBg: 'transparent',
                headerBg: 'transparent',
              },
              Menu: {
                darkItemBg: '#121212',
                darkItemSelectedBg: 'rgba(229,9,20,0.15)',
                darkItemHoverBg: 'rgba(255,255,255,0.05)',
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
