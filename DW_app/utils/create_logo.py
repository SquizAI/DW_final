from PIL import Image, ImageDraw, ImageFont
import os

def create_logo():
    # Create a new image with a transparent background
    width = 500
    height = 200
    image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Define colors
    primary_color = (41, 128, 185)  # Blue
    secondary_color = (46, 204, 113)  # Green
    
    # Draw the main circle
    circle_radius = 40
    circle_center = (width//4, height//2)
    draw.ellipse(
        [
            circle_center[0] - circle_radius,
            circle_center[1] - circle_radius,
            circle_center[0] + circle_radius,
            circle_center[1] + circle_radius
        ],
        fill=primary_color
    )
    
    # Draw the data points
    data_points = [
        (circle_center[0] - 20, circle_center[1] - 20),
        (circle_center[0] + 20, circle_center[1] - 10),
        (circle_center[0], circle_center[1] + 20)
    ]
    
    for point in data_points:
        draw.ellipse(
            [point[0] - 5, point[1] - 5, point[0] + 5, point[1] + 5],
            fill=secondary_color
        )
    
    # Connect the data points
    draw.line(data_points, fill=secondary_color, width=2)
    
    # Add text
    try:
        font = ImageFont.truetype("Arial", 60)
    except:
        font = ImageFont.load_default()
    
    draw.text(
        (width//2, height//2),
        "Data Whisperer",
        font=font,
        fill=primary_color,
        anchor="mm"
    )
    
    # Save the logo
    os.makedirs("DW_app/assets", exist_ok=True)
    image.save("DW_app/assets/logo.png")

if __name__ == "__main__":
    create_logo() 