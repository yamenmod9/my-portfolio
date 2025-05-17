from PIL import Image, ImageDraw, ImageFont
import os

# Ensure the directory exists
if not os.path.exists('static/images/projects'):
    os.makedirs('static/images/projects')

# Define image sizes and colors
width, height = 800, 500
backgrounds = {
    'ecommerce.jpg': '#4158D0',
    'fitness.jpg': '#C850C0',
    'education.jpg': '#FFC837',
}

for filename, bg_color in backgrounds.items():
    # Create a new image with a solid color background
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw some decorative elements
    # Center circle
    circle_radius = 100
    circle_center = (width // 2, height // 2)
    circle_color = 'white'
    draw.ellipse((
        circle_center[0] - circle_radius, 
        circle_center[1] - circle_radius,
        circle_center[0] + circle_radius, 
        circle_center[1] + circle_radius
    ), fill=circle_color)
    
    # Try to load a font, use default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()
    
    # Get the project name without extension
    project_name = filename.split('.')[0].title()
    
    # Draw text in the circle
    text_width, text_height = draw.textbbox((0, 0), project_name, font=font)[2:4]
    text_position = (width // 2 - text_width // 2, height // 2 - text_height // 2)
    draw.text(text_position, project_name, fill=bg_color, font=font)
    
    # Save the image
    img.save(f'static/images/projects/{filename}')
    print(f"Created {filename}")

print("All images created successfully!") 