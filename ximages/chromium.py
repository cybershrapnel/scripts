import os
import shutil
import asyncio
from playwright.async_api import async_playwright

# User-defined variable for the profile username
username = "eve"  # Replace this with your username

#also change your donwload and posted folder paths below

# Function to find the latest image in the Downloads folder
def find_latest_image_in_downloads():
    downloads_folder = r'C:\Users\admin\Downloads'  # Your downloads folder path
    files = [os.path.join(downloads_folder, f) for f in os.listdir(downloads_folder) if f.startswith("image_") and f.endswith(('.jpg', '.png', '.jpeg', '.webp'))]
    
    if not files:
        raise FileNotFoundError("No image files found in the Downloads folder.")
    
    latest_file = max(files, key=os.path.getctime)  # Get the latest file based on creation time
    return latest_file

# Function to move the posted image to the 'posted' folder
def move_image_to_posted_folder(image_path):
    posted_folder = r'C:\Users\admin\Downloads\posted'  # Define the path for the 'posted' folder
    if not os.path.exists(posted_folder):
        os.makedirs(posted_folder)  # Create the 'posted' folder if it doesn't exist
    
    image_filename = os.path.basename(image_path)  # Get the image filename
    destination = os.path.join(posted_folder, image_filename)  # Set the destination path
    
    shutil.move(image_path, destination)  # Move the image to the 'posted' folder
    print(f"Moved {image_filename} to {posted_folder}")

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # Navigate to login page
        await page.goto("https://x.com/login")

        # Wait until the URL changes to the homepage to detect successful login
        print("Please sign in manually...")
        await page.wait_for_url("https://x.com/home", timeout=0)  # Wait until the URL changes to the homepage

        # Navigate to the user's profile using the username variable
        print(f"Logged in. Navigating to profile: {username}...")
        await page.goto(f"https://x.com/{username}")  # Use the variable `username` here

        # Function to post image
        async def post_image():
            # Click the "Post" button to bring up the new post dialog
            print("Clicking the 'Post' button...")
            await page.click('a[aria-label="Post"][role="link"]')  # Select the "Post" button using the aria-label attribute

            # Wait for the new post dialog to appear
            await page.wait_for_selector('input[type="file"]', timeout=10000)

            # Find the latest image in the Downloads folder
            latest_image = find_latest_image_in_downloads()
            print(f"Found latest image: {latest_image}")

            # Upload the image using the file input
            file_input = await page.query_selector('input[type="file"]')
            await file_input.set_input_files(latest_image)

            # Wait for the image to be uploaded (adjust as needed)
            await page.wait_for_timeout(3000)

            # Click the "Post" button to submit the tweet
            print("Clicking the 'Post' button to submit the tweet...")
            await page.click('button[data-testid="tweetButton"]')

            # Wait for the post to be submitted
            await page.wait_for_timeout(3000)
            print("Post submitted successfully.")

            # Move the posted image to the 'posted' folder
            move_image_to_posted_folder(latest_image)

        # Infinite loop to post images every 5 minutes
        while True:
            await post_image()

            # Wait for 5 minutes (300000 milliseconds)
            print("Waiting 5 minutes before posting again...")
            await page.wait_for_timeout(300000)

# Run the script
asyncio.get_event_loop().run_until_complete(main())
