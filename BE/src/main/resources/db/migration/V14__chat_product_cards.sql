ALTER TABLE ai_messages ADD COLUMN recommendations_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE ai_messages ADD COLUMN comparisons_json TEXT NOT NULL DEFAULT '[]';
