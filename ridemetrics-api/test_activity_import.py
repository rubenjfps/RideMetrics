from app.database import SessionLocal
from app.services.activity_service import import_tcx_activity


TCX_FILE = "Volta_de_bicicleta_matinal.tcx"

# Temporary test value: replace this with an actual user ID
# from the public.users table before running the test.
USER_ID = "cmv8ooc0x0000ecw3zijawgpb"


def main() -> None:
    db = SessionLocal()

    try:
        activity = import_tcx_activity(
            db=db,
            file_path=TCX_FILE,
            user_id=USER_ID,
        )

        print("Activity imported successfully.")
        print(f"Activity ID: {activity.id}")
        print(f"Name: {activity.name}")
        print(f"Distance: {activity.distance_meters} meters")
        print(f"Duration: {activity.duration_seconds} seconds")

    except Exception as exc:
        print(f"Import failed: {exc}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()