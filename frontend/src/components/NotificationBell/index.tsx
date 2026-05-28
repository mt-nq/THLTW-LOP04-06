import { Badge, Popover, List, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useGetNotificationsQuery, useMarkReadMutation } from '@/store/api/notificationApi';
import { NotificationItem } from '@/types';
import { NOTIFICATION_TYPE_ICONS } from '@/utils/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Props {
  unreadCount: number;
}

export default function NotificationBell({ unreadCount }: Props) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetNotificationsQuery(undefined, { skip: !open });
  const [markRead] = useMarkReadMutation();

  const notifications = data?.data || [];

  const content = (
    <div style={{ width: 360, maxHeight: 480, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Thông báo</span>
        {unreadCount > 0 && (
          <span style={{ fontSize: 12, color: '#6366f1' }}>{unreadCount} chưa đọc</span>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
      ) : notifications.length === 0 ? (
        <Empty description="Chưa có thông báo nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item: NotificationItem) => (
            <div
              className={`notification-item ${!item.isRead ? 'unread' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => !item.isRead && markRead(item.id)}
            >
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>
                  {NOTIFICATION_TYPE_ICONS[item.type]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: item.isRead ? 400 : 600, fontSize: 13, lineHeight: 1.4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    {dayjs(item.createdAt).fromNow()}
                  </div>
                </div>
                {!item.isRead && (
                  <div style={{
                    width: 8, height: 8, background: '#6366f1',
                    borderRadius: '50%', flexShrink: 0, marginTop: 4,
                  }} />
                )}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayStyle={{ width: 380 }}
      overlayInnerStyle={{ padding: 16, borderRadius: 16 }}
    >
      <Badge count={unreadCount} offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20, color: unreadCount > 0 ? '#6366f1' : '#6b7280' }} />}
          style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Badge>
    </Popover>
  );
}
