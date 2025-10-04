import subprocess

def split_video_ffmpeg():
    input_file = "input.mp4"
    output_prefix = "output"

    # Probe video dimensions
    probe_cmd = [
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=p=0", input_file
    ]
    result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    width, height = map(int, result.stdout.strip().split(","))

    # Calculate width of one portrait slice
    single_w = width // 3

    # Define crops: x_offset and label
    crops = [
        (0, "left"),
        (single_w, "middle"),
        (2*single_w, "right")
    ]

    for x, label in crops:
        output_file = f"{output_prefix}_{label}.mp4"
        crop_filter = f"crop={single_w}:{height}:{x}:0"
        cmd = [
            "ffmpeg", "-i", input_file,
            "-filter:v", crop_filter,
            "-c:v", "libx264", "-crf", "18", "-preset", "fast",
            "-c:a", "copy",
            output_file, "-y"
        ]
        print("Running:", " ".join(cmd))
        subprocess.run(cmd, check=True)

    print("✅ Done! Generated output_left.mp4, output_middle.mp4, output_right.mp4")

# Run directly
if __name__ == "__main__":
    split_video_ffmpeg()
