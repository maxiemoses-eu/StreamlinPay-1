requimport time

def process_job():
    print("StreamlinePay worker processing job...")
    time.sleep(2)
    print("Job complete.")

if __name__ == "__main__":
    while True:
        process_job()
        time.sleep(10)ests