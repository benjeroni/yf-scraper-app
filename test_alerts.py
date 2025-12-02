import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_alerts():
    print("Testing Alerts API...")
    
    # 1. Create Alert
    alert_data = {
        "ticker": "TEST",
        "reference_price": 100.0,
        "threshold": 10.0,
        "is_active": True
    }
    res = requests.post(f"{BASE_URL}/alerts", json=alert_data)
    print(f"Create Alert: {res.status_code}")
    if res.status_code != 200:
        print(res.text)
        return

    # 2. Get Alert
    res = requests.get(f"{BASE_URL}/alerts/TEST")
    print(f"Get Alert: {res.status_code}")
    data = res.json()
    print(f"Alert Data: {data}")
    assert data['ticker'] == "TEST"
    assert data['reference_price'] == 100.0

    # 3. Update Alert (Create overwrites)
    alert_data['reference_price'] = 110.0
    res = requests.post(f"{BASE_URL}/alerts", json=alert_data)
    print(f"Update Alert: {res.status_code}")
    
    res = requests.get(f"{BASE_URL}/alerts/TEST")
    data = res.json()
    assert data['reference_price'] == 110.0
    print("Update Verified")

    # 4. Delete Alert
    res = requests.delete(f"{BASE_URL}/alerts/TEST")
    print(f"Delete Alert: {res.status_code}")

    res = requests.get(f"{BASE_URL}/alerts/TEST")
    print(f"Get Deleted Alert: {res.status_code}")
    assert res.json() == {}
    print("Delete Verified")

    print("All backend tests passed!")

if __name__ == "__main__":
    test_alerts()
