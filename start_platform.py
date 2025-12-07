import subprocess
import time
import os
import sys

def main():
    print("Starting Simulation Platform...")
    
    # 1. Install Backend Deps
    print("[1/4] Installing Backend Dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
    
    # 2. Install Frontend Deps
    print("[2/4] Installing Frontend Dependencies...")
    # Assuming npm is in path
    subprocess.check_call(["npm", "install"], cwd="frontend", shell=True)
    
    # 3. Start Backend
    print("[3/4] Starting Backend (Port 8000)...")
    backend = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"], cwd="backend")
    
    # 4. Start Frontend
    print("[4/4] Starting Frontend (Port 3000)...")
    frontend = subprocess.Popen(["npm", "run", "dev"], cwd="frontend", shell=True)
    
    print("\n--- Platform Running ---")
    print("Backend: http://localhost:8000")
    print("Frontend: http://localhost:3000")
    print("Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend.terminate()
        frontend.terminate() # This might not kill the npm tree on Windows perfectly, but good enough for dev
        sys.exit(0)

if __name__ == "__main__":
    main()
