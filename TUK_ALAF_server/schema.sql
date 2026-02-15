-- 1. 외래키 체크 해제
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 기존 테이블 초기화
DROP TABLE IF EXISTS Comment, PostImage, Post, RetrievalRequest, Item, Notification, Member, Place, Category;

-- 3. 테이블 생성
CREATE TABLE Category (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE Place (
  place_id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(100) NOT NULL,
  detail_address VARCHAR(100)
);

CREATE TABLE Member (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  point INT DEFAULT 0,
  has_retrieval_permission BOOLEAN DEFAULT TRUE,
  phone_number VARCHAR(20) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER'
);

CREATE TABLE Notification (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  category_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (member_id) REFERENCES Member(member_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Category(category_id) ON DELETE CASCADE
);

CREATE TABLE Item (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  finder_id INT,
  place_id INT NOT NULL,
  category_id INT NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  locker_number INT, 
  status VARCHAR(20) DEFAULT '보관중',
  found_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  locked_until DATETIME,
  is_retrieved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (finder_id) REFERENCES Member(member_id) ON DELETE SET NULL,
  FOREIGN KEY (place_id) REFERENCES Place(place_id),
  FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

CREATE TABLE RetrievalRequest (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  requester_id INT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COLLECTED') DEFAULT 'PENDING',
  proof_image_url VARCHAR(255),
  proof_detail_address VARCHAR(255),
  proof_description TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES Item(item_id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES Member(member_id) ON DELETE CASCADE
);

CREATE TABLE Post (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  member_id INT NOT NULL,
  post_type ENUM('LOST', 'LOOKING_FOR') NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES Member(member_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

CREATE TABLE PostImage (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE
);

CREATE TABLE Comment (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  member_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES Member(member_id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
