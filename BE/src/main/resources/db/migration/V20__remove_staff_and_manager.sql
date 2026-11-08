-- Remove legacy staff/manager accounts and their own dependent data.
-- Back up the database before applying this migration.
DELETE FROM ai_topic_switch_requests WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'))) OR new_conversation_id IN (SELECT id FROM ai_conversations WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER')));
DELETE FROM ai_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER')));
DELETE FROM ai_conversations WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER')));
DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER')));
DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM order_preview_items WHERE preview_id IN (SELECT id FROM order_previews WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER')));
DELETE FROM order_previews WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM carts WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM admin_invitations WHERE user_id IN (SELECT id FROM users WHERE role IN ('STAFF','MANAGER'));
DELETE FROM otp_challenges WHERE email IN (SELECT email FROM users WHERE role IN ('STAFF','MANAGER') AND email IS NOT NULL);
DELETE FROM users WHERE role IN ('STAFF','MANAGER');
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('CUSTOMER','ADMIN'));
