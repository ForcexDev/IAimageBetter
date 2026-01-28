import redis
import os

print("Attempting to clear limits...")
try:
    r = redis.from_url("redis://localhost:6379", decode_responses=True)
    keys = r.keys("global:demos:*") + r.keys("ip:*:last_demo")
    if keys:
        r.delete(*keys)
        print(f"Deleted keys: {keys}")
    else:
        print("No keys found in Redis.")
except Exception as e:
    print(f"Redis clear failed (expected if using in-memory): {e}")

print("Note: If using in-memory fallback, you must restart the backend to clear limits.")
