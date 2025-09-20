-- test_data
SELECT COUNT(*) as total_crimes,
       MAX(dispatch_date_time) as latest_crime,
       MIN(dispatch_date_time) as earliest_crime
FROM incidents_part1_part2
WHERE dispatch_date_time >= '2024-01-01';

-- check_columns
SELECT * FROM incidents_part1_part2 LIMIT 1;

-- get_all_crimes
SELECT
    objectid as crime_id,
    dispatch_date_time as datetime,
    dispatch_date as date,
    dispatch_time as time,
    hour as hour,
    text_general_code as crime_type,
    ucr_general as ucr_code,
    location_block as address,
    point_y as latitude,
    point_x as longitude,
    dc_dist as district,
    psa as police_service_area,
    dc_key as incident_key
FROM incidents_part1_part2
WHERE dispatch_date_time >= '{start_date}T00:00:00'
AND dispatch_date_time <= '{end_date}T23:59:59'
AND point_x IS NOT NULL
AND point_y IS NOT NULL
AND point_x != 0
AND point_y != 0
AND point_y BETWEEN 39.8 AND 40.2
AND point_x BETWEEN -75.4 AND -74.9';

-- get_recent_crimes
SELECT
    objectid as crime_id,
    dispatch_date_time as datetime,
    dispatch_date as date,
    dispatch_time as time,
    hour as hour,
    text_general_code as crime_type,
    ucr_general as ucr_code,
    location_block as address,
    point_y as latitude,
    point_x as longitude,
    dc_dist as district,
    psa as police_service_area,
    dc_key as incident_key
FROM incidents_part1_part2
WHERE dispatch_date_time >= '{start_time}'
AND dispatch_date_time <= '{end_time}'
AND point_x IS NOT NULL
AND point_y IS NOT NULL
AND point_x != 0
AND point_y != 0
AND point_y BETWEEN 39.8 AND 40.2
AND point_x BETWEEN -75.4 AND -74.9
ORDER BY dispatch_date_time DESC
LIMIT {limit};