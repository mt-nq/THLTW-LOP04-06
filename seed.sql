INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES 
(5, 'Yêu cầu được duyệt', 'Yêu cầu mượn Loa Bluetooth JBL Xtreme 3 đã được phê duyệt.', 'APPROVED', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(5, 'Yêu cầu được duyệt', 'Yêu cầu mượn Micro không dây Shure BLX288 đã được phê duyệt.', 'APPROVED', true, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 'Cảnh báo quá hạn', 'Thiết bị Máy tính xách tay Dell Inspiron của bạn đã quá hạn trả.', 'OVERDUE_WARNING', false, CURRENT_TIMESTAMP - INTERVAL '1 day');
