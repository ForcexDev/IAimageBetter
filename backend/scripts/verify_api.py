import requests
import time

print("Waiting for server to start...")
time.sleep(3)

try:
    # 1. Test Status
    print("Testing /api/status...")
    r = requests.get("http://localhost:8000/api/status")
    print(f"Status: {r.status_code}")
    print(r.json())
    


    # 3. Test Enhancement (Mock)
    print("\nTesting /api/enhance (Mock)...")
    # Create a dummy image
    from PIL import Image
    import io
    img = Image.new('RGB', (60, 30), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    
    files = {'file': ('test.png', img_byte_arr, 'image/png')}
    r = requests.post("http://localhost:8000/api/enhance", files=files)
    print(f"Enhance Status: {r.status_code}")
    if r.status_code == 200:
        print("Success! Image enhanced.")
    else:
        print(f"Error: {r.text}")

except Exception as e:
    print(f"Test Failed: {e}")
