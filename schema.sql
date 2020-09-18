
DROP TABLE IF EXISTS cities, weather;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude decimal,
  longitude decimal
);


CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  weather_time VARCHAR(10),
  forecast VARCHAR(255)
);

INSERT INTO weatherdata (search_query, forecast, time) VALUES ('seattle', 'awesome', '9/14/2010');