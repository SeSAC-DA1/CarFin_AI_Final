DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS vehicles_insurance CASCADE;
DROP TABLE IF EXISTS vehicles_inspect CASCADE;
DROP TABLE IF EXISTS hyundai_segment_purchases CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  car_seq INT NOT NULL,
  vehicle_no VARCHAR(20) NOT NULL UNIQUE,
  platform VARCHAR(16),
  origin VARCHAR(16),
  car_type VARCHAR(16),
  manufacturer VARCHAR(20),
  model VARCHAR(50),
  generation VARCHAR(50),
  trim VARCHAR(50),
  fuel_type VARCHAR(16),
  transmission VARCHAR(16),
  color_name VARCHAR(50),
  model_year INT,
  first_registration_date INT,
  distance INT,
  price INT,
  origin_price INT,
  sell_type VARCHAR(50),
  location VARCHAR(20),
  detail_url VARCHAR(1024),
  photo VARCHAR(1024)
);

CREATE TABLE vehicles_inspect (
  vehicle_id INT PRIMARY KEY REFERENCES vehicles(vehicle_id),
  warranty_type VARCHAR(50),
  tuning VARCHAR(50),
  change_usage VARCHAR(16),
  recall VARCHAR(16),
  recall_status VARCHAR(16),
  accident_history VARCHAR(16),
  simple_repair VARCHAR(16)
);

CREATE TABLE vehicles_insurance (
  vehicle_id INT PRIMARY KEY REFERENCES vehicles(vehicle_id),
  vehicle_no VARCHAR(20),
  owner_change_cnt INT,
  my_accident_cnt INT,
  my_accident_cost INT,
  other_accident_cnt INT,
  other_accident_cost INT,
  is_disclosed INT
);

CREATE TABLE hyundai_segment_purchases (
  id SERIAL PRIMARY KEY,
  car_type VARCHAR(16),
  manufacturer VARCHAR(20),
  model VARCHAR(50),
  age INT,
  gender VARCHAR(16),
  satisfaction REAL,
  review VARCHAR(2048)
);

CREATE TABLE conversations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  session_id VARCHAR NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT,
  vehicle_recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_vehicles_manufacturer ON vehicles(manufacturer);
CREATE INDEX idx_vehicles_model ON vehicles(model);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_model_year ON vehicles(model_year);
CREATE INDEX idx_reviews_model ON hyundai_segment_purchases(model);

-- 샘플 차량 데이터 삽입
INSERT INTO vehicles (car_seq, vehicle_no, platform, manufacturer, model, model_year, price, distance, fuel_type, transmission, car_type, location, photo, detail_url) VALUES
(1, '12가1234', 'encar', '현대', '쏘나타', 2020, 2000, 45000, '가솔린', '자동', '세단', '서울', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=123'),
(2, '34나5678', 'encar', '기아', '쏘렌토', 2019, 2500, 60000, '디젤', '자동', 'SUV', '경기', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=456'),
(3, '56다9012', 'encar', '현대', '팰리세이드', 2021, 4500, 30000, '디젤', '자동', 'SUV', '서울', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=789'),
(4, '78라3456', 'encar', '벤츠', 'E-Class', 2018, 3800, 55000, '가솔린', '자동', '세단', '서울', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=101'),
(5, '90마7890', 'encar', 'BMW', '5시리즈', 2019, 4200, 48000, '디젤', '자동', '세단', '경기', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=102'),
(6, '12바2345', 'encar', '현대', '아반떼', 2021, 1800, 25000, '가솔린', '자동', '세단', '인천', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=103'),
(7, '34사6789', 'encar', '기아', 'K5', 2020, 2200, 35000, '하이브리드', '자동', '세단', '서울', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=104'),
(8, '56아0123', 'encar', '제네시스', 'G80', 2020, 5500, 40000, '가솔린', '자동', '세단', '서울', 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=105'),
(9, '78자4567', 'encar', '테슬라', 'Model 3', 2021, 4800, 20000, '전기', '자동', '세단', '경기', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=106'),
(10, '90차8901', 'encar', '현대', '투싼', 2020, 2400, 50000, '가솔린', '자동', 'SUV', '서울', 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=400', 'https://www.encar.com/dc/dc_cardetailview.do?carid=107');

-- 샘플 리뷰 데이터
INSERT INTO hyundai_segment_purchases (car_type, manufacturer, model, age, gender, satisfaction, review) VALUES
('세단', '현대', '쏘나타', 35, '남성', 4.5, '가족과 함께 타기 좋은 차입니다. 연비도 만족스럽고 승차감이 편안합니다.'),
('SUV', '현대', '팰리세이드', 40, '여성', 5.0, '3열 시트가 정말 넓어서 가족 여행 갈 때 최고입니다. 안전장치도 훌륭해요.'),
('세단', '현대', '아반떼', 28, '남성', 4.0, '출퇴근용으로 딱 좋습니다. 가격 대비 성능이 우수해요.');
