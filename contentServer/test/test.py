import requests
import concurrent.futures

# Define the URL to which you want to make requests
URL = "http://localhost:4000/"

# Function to make a single HTTP request
def make_request(url):
    try:
        response = requests.get(url)
        # You can do something with the response if needed
        return response.status_code
    except requests.RequestException as e:
        # Handle exceptions if the request fails
        return str(e)

def main():
    # List to hold URLs for concurrent requests
    urls = [URL] * 1000

    # Using ThreadPoolExecutor to perform requests concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        # Map each URL to the make_request function to execute concurrently
        results = executor.map(make_request, urls)
    
    # Printing out the results
    for result in results:
        print(result)

if __name__ == "__main__":
    main()
