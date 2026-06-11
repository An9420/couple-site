-- ============================================
-- Couple Memorial Site - Database Schema
-- Run: mysql -u root < server/schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS couple_site
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE couple_site;

-- ============ Couple Info (single row, id=1) ============
CREATE TABLE IF NOT EXISTS couple_info (
  id INT PRIMARY KEY DEFAULT 1,
  name1 VARCHAR(50) NOT NULL DEFAULT '🐰 小安',
  name2 VARCHAR(50) NOT NULL DEFAULT '🐲 小婷子',
  avatar1 VARCHAR(500) DEFAULT '',
  avatar2 VARCHAR(500) DEFAULT '',
  start_date DATE NOT NULL DEFAULT '2023-06-29',
  password_hash VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default row if not exists
INSERT IGNORE INTO couple_info (id) VALUES (1);

-- ============ Diaries ============
CREATE TABLE IF NOT EXISTS diaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  mood VARCHAR(10) NOT NULL DEFAULT '💕',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============ Milestones ============
CREATE TABLE IF NOT EXISTS milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  icon VARCHAR(10) DEFAULT '🎯',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default milestones
INSERT INTO milestones (title, event_date, icon) VALUES
  ('💫 第一次见面', '2023-06-15', '✨'),
  ('💝 在一起的日子', '2023-06-29', '💕'),
  ('🌹 第一次约会', '2023-07-07', '🥂'),
  ('💋 第一次亲吻', '2024-02-14', '💗'),
  ('💍 周年纪念日', '2024-06-29', '💎')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ============ Secrets / Whisper Messages ============
CREATE TABLE IF NOT EXISTS secrets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Default secrets
INSERT INTO secrets (content) VALUES
  ('你是我所有温柔的理由。'),
  ('有你的每一天，都是最好的时光。'),
  ('世界很大，但我的心很小，小到只装得下你。'),
  ('遇见你，是我最美丽的意外。'),
  ('我想和你一起，看遍这世界所有的日出日落。'),
  ('你笑起来的时候，整个世界都亮了。'),
  ('不管未来有多远，我都想和你一起走。'),
  ('你是我平淡生活里的甜蜜奇迹。')
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- ============ Media (Photos & Videos) ============
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('image', 'video') NOT NULL DEFAULT 'image',
  data_url LONGTEXT DEFAULT NULL,
  original_name VARCHAR(255) DEFAULT '',
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(100) DEFAULT '',
  note VARCHAR(500) DEFAULT '',
  location VARCHAR(200) DEFAULT '',
  taken_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============ Daily Check-ins ============
CREATE TABLE IF NOT EXISTS checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  checkin_date DATE NOT NULL UNIQUE,
  mood_emoji VARCHAR(10) DEFAULT '💕',
  note VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (checkin_date)
) ENGINE=InnoDB;

-- ============ Couple Tasks ============
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  status ENUM('pending', 'done') DEFAULT 'pending',
  assigned_to ENUM('both', 'person1', 'person2') DEFAULT 'both',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============ Message Board ============
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author ENUM('person1', 'person2') NOT NULL,
  content VARCHAR(1000) NOT NULL,
  sticker VARCHAR(10) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============ Footprints (Travel Map) ============
CREATE TABLE IF NOT EXISTS footprints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  visit_date DATE NOT NULL,
  note VARCHAR(500) DEFAULT '',
  photo_path VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (visit_date)
) ENGINE=InnoDB;

-- ============ Bucket List ============
CREATE TABLE IF NOT EXISTS bucketlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  completed TINYINT(1) DEFAULT 0,
  completed_date DATE DEFAULT NULL,
  due_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============ First-Time Records ============
CREATE TABLE IF NOT EXISTS firsttimes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  event_date DATE NOT NULL,
  note VARCHAR(500) DEFAULT '',
  icon VARCHAR(10) DEFAULT '🌟',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============ Easter Egg Unlocks ============
CREATE TABLE IF NOT EXISTS easteregg_unlocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  egg_id VARCHAR(50) NOT NULL UNIQUE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
