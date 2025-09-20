from datetime import datetime

def _categorize_crime(crime_type):
    crime_type = crime_type.upper()
    if any(word in crime_type for word in ['HOMICIDE', 'MURDER']):
        return 'violent'
    elif any(word in crime_type for word in ['RAPE', 'SEXUAL']):
        return 'violent'
    elif any(word in crime_type for word in ['ROBBERY', 'ARMED']):
        return 'violent'
    elif any(word in crime_type for word in ['ASSAULT', 'BATTERY']):
        return 'violent'
    elif any(word in crime_type for word in ['BURGLARY', 'BREAKING']):
        return 'property'
    elif any(word in crime_type for word in ['THEFT', 'LARCENY', 'STOLEN']):
        return 'property'
    elif any(word in crime_type for word in ['VEHICLE', 'AUTO']):
        return 'property'
    elif any(word in crime_type for word in ['DRUG', 'NARCOTIC']):
        return 'drug'
    elif any(word in crime_type for word in ['VANDALISM', 'DAMAGE']):
        return 'property'
    else:
        return 'other'

def _get_crime_severity(crime_type):
    crime_type = crime_type.upper()
    if any(word in crime_type for word in ['HOMICIDE', 'MURDER', 'RAPE', 'ROBBERY', 'ARMED']):
        return 'high'
    elif any(word in crime_type for word in ['ASSAULT', 'BURGLARY', 'VEHICLE', 'AUTO']):
        return 'medium'
    else:
        return 'low'

def _calculate_minutes_ago(datetime_str):
    if not datetime_str:
        return None
    try:
        crime_time = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        now = datetime.now(crime_time.tzinfo) if crime_time.tzinfo else datetime.now()
        diff = now - crime_time
        return int(diff.total_seconds() / 60)
    except:
        return None

def _get_crime_type_summary(crimes):
    crime_counts = {}
    for crime in crimes:
        crime_type = crime.get('crime_type', 'Unknown')
        crime_counts[crime_type] = crime_counts.get(crime_type, 0) + 1
    return dict(sorted(crime_counts.items(), key=lambda x: x[1], reverse=True))

def _get_district_summary(crimes):
    district_counts = {}
    for crime in crimes:
        district = crime.get('district', 'Unknown')
        if district:
            district_counts[district] = district_counts.get(district, 0) + 1
    return dict(sorted(district_counts.items(), key=lambda x: x[1], reverse=True))

def _get_severity_breakdown(crimes):
    severity_counts = {'high': 0, 'medium': 0, 'low': 0}
    for crime in crimes:
        severity = crime.get('severity', 'low')
        severity_counts[severity] += 1
    return severity_counts

def _get_hourly_pattern(crimes):
    hourly_counts = {str(i): 0 for i in range(24)}
    for crime in crimes:
        hour = crime.get('hour')
        if hour is not None:
            hourly_counts[str(hour)] += 1
    return hourly_counts

def _generate_real_time_alerts(crimes):
    alerts = []
    breaking_crimes = [c for c in crimes if c.get('is_breaking')]
    if breaking_crimes:
        alerts.append({
            'type': 'breaking',
            'message': f'{len(breaking_crimes)} crimes reported in the last hour',
            'severity': 'high' if len(breaking_crimes) > 3 else 'medium'
        })
    high_severity_crimes = [c for c in crimes if c.get('severity') == 'high']
    if len(high_severity_crimes) > 5:
        alerts.append({
            'type': 'cluster',
            'message': f'{len(high_severity_crimes)} high-severity crimes in recent period',
            'severity': 'high'
        })
    district_summary = _get_district_summary(crimes)
    if district_summary:
        most_active_district = max(district_summary.items(), key=lambda x: x[1])
        if most_active_district[1] > 10:
            alerts.append({
                'type': 'hotspot',
                'message': f'District {most_active_district[0]} has {most_active_district[1]} recent incidents',
                'severity': 'medium'
            })
    return alerts
