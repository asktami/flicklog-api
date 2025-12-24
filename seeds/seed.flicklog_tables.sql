-- Insertion order is important, Reviews and Watchlist require Users and Movies because of relationships so those must be inserted first!

BEGIN;

TRUNCATE
  reviews,
  watchlist,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (username,  password, fullname, app)
VALUES
('testUser', '$2a$12$QRHM7CT4rca6bLbqyej.3eCNagLOLU1.qZGEbbpXRClouaWO99ln.', 'Test User', 'flicklog'),
('dunder', '$2a$12$ijvWD84EtJhC8AKFjT1cB.Bcm7T28M7/9pPs6E03Yl8z5rcd6Ld5.', 'Dunder Mifflin', 'flicklog')
  ;

INSERT INTO watchlist (movie_id, user_id,poster_path, backdrop_path, title, original_title, release_date, overview, vote_average, vote_count, app)
VALUES
(348, 1,'/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg','/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg','Alien','Alien','1979-05-25','During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.', 8.1,5694, 'flicklog'),
(11,1,'/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg','/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg','','Star Wars','1977-05-25','Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',8.1, 5694, 'flicklog'),
(348, 2,'/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg','/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg','Alien','Alien','1979-05-25','During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.', 8.1,5694, 'flicklog'),
(11,2,'/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', '/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg','','Star Wars','1977-05-25','Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',8.1, 5694, 'flicklog');


INSERT INTO reviews (review, rating, movie_id, user_id, poster_path, backdrop_path, title, original_title, release_date, overview, vote_average, vote_count, app)
VALUES
('Alien test review!', 5, 348, 1,'/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg','/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg','Alien','Alien','1979-05-25','During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.', 8.1,5694, 'flicklog'),
('Star Wars test review!',5,11,1,'/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', '/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg','','Star Wars','1977-05-25','Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',8.1, 5694, 'flicklog'),
('Alien test review!', 5, 348, 2,'/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg','/AmR3JG1VQVxU8TfAvljUhfSFUOx.jpg','Alien','Alien','1979-05-25','During its return to the earth, commercial spaceship Nostromo intercepts a distress signal from a distant planet. When a three-member team of the crew discovers a chamber containing thousands of eggs on the planet, a creature inside one of the eggs attacks an explorer. The entire crew is unaware of the impending nightmare set to descend upon them when the alien parasite planted inside its unfortunate host is birthed.', 8.1,5694, 'flicklog'),
('Star Wars test review!',5,11,2,'/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', '/pPj1yM2PXiC56GkUYmoT3qR9zka.jpg','','Star Wars','1977-05-25','Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire.',8.1, 5694, 'flicklog');

COMMIT;