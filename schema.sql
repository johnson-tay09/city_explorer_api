
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  city_name VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255)
)