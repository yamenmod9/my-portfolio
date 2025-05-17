from PIL import Image, ImageDraw, ImageFont
import os
import json
import glob

def create_screenshot(output_path, title, color, width=1200, height=800):
    # Create a new image with a solid color background
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, use default if not available
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 30)
    except IOError:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Draw a header bar
    draw.rectangle([(0, 0), (width, 80)], fill='white')
    
    # Draw a footer bar
    draw.rectangle([(0, height-60), (width, height)], fill='white')
    
    # Draw the title
    title_width, title_height = draw.textbbox((0, 0), title, font=title_font)[2:4]
    draw.text(
        (width // 2 - title_width // 2, height // 2 - title_height // 2),
        title,
        fill='white',
        font=title_font
    )
    
    # Add some UI elements
    # Left sidebar - use a semi-transparent white overlay
    sidebar_overlay = Image.new('RGBA', (200, height-140), (255, 255, 255, 50))
    img.paste(sidebar_overlay, (0, 80), sidebar_overlay)
    
    # Draw some dummy content
    for i in range(5):
        y_pos = 120 + i * 60
        draw.rectangle([(20, y_pos), (180, y_pos + 40)], fill='white', outline='white')
    
    # Draw some dummy content in the main area
    for i in range(3):
        for j in range(3):
            x = 230 + j * (width - 260) // 3
            y = 120 + i * 200
            draw.rectangle(
                [(x, y), (x + (width - 260) // 3 - 30, y + 160)],
                fill='white',
                outline='white'
            )
    
    # Save the image
    img.save(output_path)
    print(f"Created {output_path}")

# Process each project
project_folders = [f for f in glob.glob('projects/*/') if os.path.isdir(f) and not f.endswith('blocks/')]

for project_folder in project_folders:
    project_name = os.path.basename(os.path.dirname(project_folder))
    info_file = os.path.join(project_folder, 'info.json')
    
    # Skip if no info file exists
    if not os.path.exists(info_file):
        continue
    
    # Load project info
    with open(info_file, 'r') as f:
        project_info = json.load(f)
    
    # Create screenshots directory if it doesn't exist
    screenshots_dir = os.path.join(project_folder, 'screenshots')
    os.makedirs(screenshots_dir, exist_ok=True)
    
    # Generate screenshots
    for screenshot in project_info.get('screenshots', []):
        output_path = os.path.join(screenshots_dir, screenshot)
        page_name = os.path.splitext(screenshot)[0].title()
        create_screenshot(
            output_path, 
            f"{project_info['title']} - {page_name}", 
            project_info['color']
        )

print("All screenshots created successfully!") 