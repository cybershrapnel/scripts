import os
import shutil
import asyncio
from playwright.async_api import async_playwright
import random
import subprocess
import time
from mutagen.mp3 import MP3  # Library to get MP3 duration
from PIL import Image

# User-defined variable for the profile username
username = "eve000042"  # not needed in this script anymore fill in your group communities url below in script

# Function to find the latest image in the Downloads folder
def find_latest_image_in_downloads():
    downloads_folder = r'C:\Users\shrap\Downloads\posted'  # Your downloads folder path
    files = [os.path.join(downloads_folder, f) for f in os.listdir(downloads_folder) if f.startswith("image_") and f.endswith(('.jpg', '.png', '.jpeg', '.webp'))]
    
    if not files:
        raise FileNotFoundError("No image files found in the Downloads folder.")
    
    latest_file = max(files, key=os.path.getctime)  # Get the latest file based on creation time
    return latest_file

# Function to find a random mp3 file in the music folder
def find_random_mp3():
    music_folder = r'C:\Users\shrap\Downloads\music'  # Your music folder path
    mp3_files = [os.path.join(music_folder, f) for f in os.listdir(music_folder) if f.endswith('.mp3')]
    
    if not mp3_files:
        raise FileNotFoundError("No mp3 files found in the music folder.")
    
    return random.choice(mp3_files)

# Function to get the duration of the mp3 file
def get_mp3_duration(mp3_path):
    audio = MP3(mp3_path)
    return int(audio.info.length)

# Function to get the image resolution using Pillow
def get_image_resolution(image_path):
    with Image.open(image_path) as img:
        width, height = img.size
    return width, height

# Function to create video with image and mp3, matching the image resolution
def create_video(image_path, mp3_path, video_output_path, video_duration):
    # Get the resolution of the image using Pillow
    width, height = get_image_resolution(image_path)

    # Create video using the image and mp3 with matching resolution
    command = [
        'ffmpeg', '-loop', '1', '-i', image_path, '-i', mp3_path, '-c:v', 'libx264', '-tune', 'stillimage', 
        '-c:a', 'aac', '-b:a', '192k', '-pix_fmt', 'yuv420p', 
        '-s', f'{width}x{height}',  # Set video resolution to match image resolution
        '-t', str(video_duration), '-shortest', video_output_path
    ]
    
    subprocess.run(command, check=True)
    print(f"Created video: {video_output_path}")

    # Ensure that the file is fully created before proceeding
    while not os.path.exists(video_output_path):
        print(f"Waiting for {video_output_path} to be created...")
        time.sleep(1)

    print(f"Video {video_output_path} is ready for upload.")



# Function to move files to the 'posted' folder
def move_to_posted_folder(file_path):
    posted_folder = r'C:\Users\shrap\Downloads\posted\reposted'  # Define the path for the 'posted' folder
    if not os.path.exists(posted_folder):
        os.makedirs(posted_folder)  # Create the 'posted' folder if it doesn't exist
    
    file_name = os.path.basename(file_path)  # Get the file name
    destination = os.path.join(posted_folder, file_name)  # Set the destination path
    shutil.move(file_path, destination)  # Move the file to the 'posted' folder
    print(f"Moved {file_name} to {posted_folder}")

async def set_native_value(page, selector, value):
    await page.evaluate(f"""
        const element = document.querySelector('{selector}');
        if (element && element.getAttribute('contenteditable') === 'true') {{
            element.focus();
            
            // Insert text using execCommand to simulate typing behavior
            document.execCommand('insertText', false, '{value}');
            
            // Dispatch input and key events to simulate user interaction
            const inputEvent = new Event('input', {{ bubbles: true }});
            element.dispatchEvent(inputEvent);
        }}
    """)




async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.firefox.launch(headless=False)
        page = await browser.new_page()

        # Navigate to login page
        await page.goto("https://x.com/login")

        # Wait until the URL changes to the homepage to detect successful login
        print("Please sign in manually...")
        await page.wait_for_url("https://x.com/home", timeout=0)  # Wait until the URL changes to the homepage

        # Navigate to the user's profile using the username variable
        print(f"Logged in. Navigating to profile: {username}...")
        await page.goto(f"https://x.com/i/communities/1835107541757706623")  # Use the variable `username` here
        await page.wait_for_timeout(3000)




        # Function to post video
        async def post_video():
            # Click the "Post" button to bring up the new post dialog
            print("Clicking the 'Post' button...")
            await page.click('a[aria-label="Post"][role="link"]')  # Select the "Post" button using the aria-label attribute

            # Wait for the new post dialog to appear
            await page.wait_for_selector('input[type="file"]', timeout=10000)

            # Find the latest image in the Downloads folder
            latest_image = find_latest_image_in_downloads()
            print(f"Found latest image: {latest_image}")

            # Find a random mp3 file in the music folder
            random_mp3 = find_random_mp3()
            print(f"Found random mp3: {random_mp3}")
            mp3_duration = get_mp3_duration(random_mp3)
            # Create the video
            video_output_path = os.path.join(os.path.dirname(random_mp3), os.path.splitext(os.path.basename(random_mp3))[0] + '.mp4')
            create_video(latest_image, random_mp3, video_output_path, mp3_duration)

            # Wait for the file to be ready before upload
            while not os.path.exists(video_output_path):
                print(f"Waiting for {video_output_path} to be available for upload...")
                await asyncio.sleep(1)

            # Upload the video using the file input
            file_input = await page.query_selector('input[type="file"]')
            await file_input.set_input_files(video_output_path)
            await page.wait_for_timeout(13000)




            # Write the song name as the post text (without .mp3 or .mp4)
            song_name = os.path.splitext(os.path.basename(random_mp3))[0]

            # Call set_native_value to ensure the UI detects the input
            await set_native_value(page, 'div[contenteditable="true"][role="textbox"]', song_name)


            # Click the "Post" button to submit the tweet
            print("Clicking the 'Post' button to submit the tweet...")
            await page.click('button[data-testid="tweetButton"]')

            # Wait for the post to be submitted
            await page.wait_for_timeout(3000)
            print("Post submitted successfully.")
 
            # Move the posted files to the 'posted' folder
            move_to_posted_folder(latest_image)
            move_to_posted_folder(random_mp3)
            move_to_posted_folder(video_output_path)

        # Infinite loop to post videos every 5 minutes
        while True:
            await post_video()

            # Wait for 15 minutes (900000 milliseconds)
            print("Waiting 15 minutes before posting again...")
            await page.wait_for_timeout(900000)

# Run the script
asyncio.get_event_loop().run_until_complete(main())
