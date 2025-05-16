CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image LONGBLOB,
  path VARCHAR(255),
  url VARCHAR(500),
  mime_type VARCHAR(100),
  storage_type ENUM('database', 'disk', 'cloud') NOT NULL DEFAULT 'database',
  owner_type VARCHAR(50) NOT NULL,
  owner_id INT NOT NULL,
  tag VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
