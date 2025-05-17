from PIL import Image, ImageDraw, ImageFont
import os

def create_finance_image(output_path, width=1200, height=800):
    # Create a new image with a gradient background
    img = Image.new('RGB', (width, height), "#FFC837")
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
    title = "Financial Dashboard"
    title_width, title_height = draw.textbbox((0, 0), title, font=title_font)[2:4]
    draw.text(
        (width // 2 - title_width // 2, 120),
        title,
        fill='white',
        font=title_font
    )
    
    # Draw a dashboard-like UI
    # Main chart area
    draw.rectangle([(50, 200), (width-50, 450)], fill='white', outline='white')
    
    # Draw some dummy chart bars
    bar_colors = ['#4158D0', '#C850C0', '#4158D0', '#C850C0', '#4158D0', '#C850C0']
    bar_width = (width-200) // 12
    for i in range(6):
        bar_height = 100 + (i % 3) * 50
        x_pos = 100 + i * (bar_width + 30)
        y_pos = 450 - bar_height
        draw.rectangle(
            [(x_pos, y_pos), (x_pos + bar_width, 450)],
            fill=bar_colors[i]
        )
    
    # Draw some stat boxes
    for i in range(3):
        x_pos = 100 + i * ((width - 200) // 3)
        draw.rectangle(
            [(x_pos, 500), (x_pos + (width-200)//3 - 50, 600)],
            fill='white'
        )
        
        # Add some dummy stats
        stat_title = ["Revenue", "Expenses", "Profit"][i]
        stat_value = ["$125,430", "$78,290", "$47,140"][i]
        
        # Draw stat title
        title_width, title_height = draw.textbbox((0, 0), stat_title, font=subtitle_font)[2:4]
        draw.text(
            (x_pos + ((width-200)//3 - 50)//2 - title_width//2, 520),
            stat_title,
            fill='#333333',
            font=subtitle_font
        )
        
        # Draw stat value
        value_width, value_height = draw.textbbox((0, 0), stat_value, font=subtitle_font)[2:4]
        draw.text(
            (x_pos + ((width-200)//3 - 50)//2 - value_width//2, 560),
            stat_value,
            fill='#4158D0',
            font=subtitle_font
        )
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Save the image
    img.save(output_path)
    print(f"Created {output_path}")

# Generate the finance dashboard image
create_finance_image("projects/finance/finance_dashboard.png")
print("Finance dashboard image created successfully!") 