CREATE FUNCTION immutable_to_tsvector(txt text) RETURNS tsvector AS $$
  SELECT to_tsvector('simple', txt)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE;
