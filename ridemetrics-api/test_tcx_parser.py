from pathlib import Path

from app.services.tcx_parser import parse_tcx


tcx_file = Path("Volta_de_bicicleta_matinal.tcx")

activity = parse_tcx(tcx_file)

print("\n--- Activity summary ---")
print(f"Name: {activity['name']}")
print(f"Started at: {activity['started_at']}")
print(f"Duration: {activity['duration_seconds']} seconds")
print(f"Distance: {activity['distance_meters']} meters")
print(f"Elevation gain: {activity['elevation_gain_meters']} meters")
print(f"Average speed: {activity['average_speed_kmh']} km/h")
print(f"Max speed: {activity['max_speed_kmh']} km/h")
print(f"Average heart rate: {activity['average_heart_rate']} bpm")
print(f"Max heart rate: {activity['max_heart_rate']} bpm")
print(f"Track points: {activity['track_points_count']}")

if activity["track_points"]:
    print("\n--- First track point ---")
    print(activity["track_points"][0])