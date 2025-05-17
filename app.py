from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
import os
import json
import datetime
import glob

app = Flask(__name__)
app.secret_key = "portfolio_secret_key"

# Data storage path
RATINGS_FILE = 'projects/ratings.json'
PROJECTS_DIR = 'projects'

# Initialize ratings file if it doesn't exist
def init_ratings_file():
    if not os.path.exists('projects'):
        os.makedirs('projects')
    
    if not os.path.exists(RATINGS_FILE):
        with open(RATINGS_FILE, 'w') as f:
            json.dump([], f)

# Load ratings from file
def load_ratings():
    init_ratings_file()
    try:
        with open(RATINGS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

# Save ratings to file
def save_rating(project_id, name, email, phone, rating):
    ratings = load_ratings()
    
    # Add new rating
    new_rating = {
        'id': len(ratings) + 1,
        'project_id': project_id,
        'name': name,
        'email': email,
        'phone': phone,
        'rating': rating,
        'date': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    ratings.append(new_rating)
    
    # Save to file
    with open(RATINGS_FILE, 'w') as f:
        json.dump(ratings, f, indent=4)
    
    return new_rating

# Load projects from directory
def load_projects():
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    
                    # Calculate dirname for screenshot paths
                    project_dirname = os.path.basename(os.path.dirname(folder))
                    project['dirname'] = project_dirname
                    
                    projects.append(project)
                except json.JSONDecodeError:
                    print(f"Error loading project info from {info_file}")
    
    # Sort by ID
    projects.sort(key=lambda p: p.get('id', 999))
    
    # Ensure transcription project (ID 3) is included, then limit to 3 projects total
    transcription_project = next((p for p in projects if p.get('id') == 3), None)
    
    # Get top 3 projects by ID
    top_projects = projects[:3]
    
    # If transcription project exists but is not in top 3, replace the last one
    if transcription_project and transcription_project not in top_projects:
        top_projects = projects[:2] + [transcription_project]
    
    return top_projects  # Return 3 projects with transcription prioritized

@app.route('/')
def index():
    # Load projects
    projects = load_projects()
    
    # Calculate average ratings for each project
    ratings = load_ratings()
    
    for project in projects:
        project_ratings = [r for r in ratings if r['project_id'] == project['id']]
        if project_ratings:
            avg_rating = sum(r['rating'] for r in project_ratings) / len(project_ratings)
            rating_count = len(project_ratings)
        else:
            avg_rating = 0
            rating_count = 0
            
        project['avg_rating'] = avg_rating
        project['rating_count'] = rating_count
    
    return render_template('index.html', 
                          title="My Portfolio",
                          about_me="I am a passionate web developer and designer with expertise in creating modern, responsive, and user-friendly websites. With over 5 years of experience, I've successfully completed 3 high-quality projects for clients worldwide, maintaining a perfect 5-star rating on Fiverr. My technical skills include HTML, CSS, JavaScript, Python, and various frameworks. I specialize in transforming ideas into digital realities, focusing on clean code, beautiful design, and exceptional user experience. Whether you need an e-commerce platform, mobile app UI, or educational portal, I deliver high-quality solutions that exceed expectations.",
                          services=[
                              {"count": "3", "text": "Projects Completed"},
                              {"count": "100%", "text": "Client Satisfaction"},
                              {"count": "5⭐", "text": "Fiverr Rating"}
                          ],
                          projects=projects)

@app.route('/project/<int:project_id>')
def view_project(project_id):
    # Load all projects (not just the top 3)
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    project_dirname = os.path.basename(os.path.dirname(folder))
                    project['dirname'] = project_dirname
                    projects.append(project)
                except json.JSONDecodeError:
                    pass
    
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        flash("Project not found")
        return redirect(url_for('index'))
    
    # Get ratings for this project
    ratings = load_ratings()
    project_ratings = [r for r in ratings if r['project_id'] == project_id]
    
    # Calculate average rating and rating distribution
    if project_ratings:
        avg_rating = sum(r['rating'] for r in project_ratings) / len(project_ratings)
        # Calculate rating counts for each star level (1-5)
        rating_counts = [0, 0, 0, 0, 0]  # Index 0 = 1 star, index 4 = 5 stars
        for r in project_ratings:
            rating_counts[r['rating']-1] += 1
    else:
        avg_rating = 0
        rating_counts = [0, 0, 0, 0, 0]
    
    # Sort ratings by date (newest first)
    project_ratings.sort(key=lambda x: x['date'], reverse=True)
        
    return render_template('project.html', 
                          project=project, 
                          project_ratings=project_ratings,
                          avg_rating=avg_rating,
                          rating_counts=rating_counts,
                          title=project['title'])

@app.route('/project/<int:project_id>/image/<path:filename>')
def project_image(project_id, filename):
    # Load all projects
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    project_dirname = os.path.basename(os.path.dirname(folder))
                    project['dirname'] = project_dirname
                    projects.append(project)
                except json.JSONDecodeError:
                    pass
    
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        flash("Project not found")
        return redirect(url_for('index'))
    
    project_dirname = project.get('dirname', str(project_id))
    return send_from_directory(f'{PROJECTS_DIR}/{project_dirname}', filename)

@app.route('/project/<int:project_id>/screenshot/<path:filename>')
def project_screenshot(project_id, filename):
    # Load all projects
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    project_dirname = os.path.basename(os.path.dirname(folder))
                    project['dirname'] = project_dirname
                    projects.append(project)
                except json.JSONDecodeError:
                    pass
    
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        flash("Project not found")
        return redirect(url_for('index'))
    
    project_dirname = project.get('dirname', str(project_id))
    
    # Check if the screenshot exists in the screenshots directory
    screenshot_path = os.path.join(PROJECTS_DIR, project_dirname, 'screenshots', filename)
    
    # If it doesn't exist in the screenshots directory, check in the main project directory
    if not os.path.exists(screenshot_path) and os.path.exists(os.path.join(PROJECTS_DIR, project_dirname, filename)):
        return send_from_directory(f'{PROJECTS_DIR}/{project_dirname}', filename)
    
    return send_from_directory(f'{PROJECTS_DIR}/{project_dirname}/screenshots', filename)

@app.route('/rate/<int:project_id>', methods=['POST'])
def rate_project(project_id):
    # Load all projects
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    projects.append(project)
                except json.JSONDecodeError:
                    pass
    
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        return jsonify({'success': False, 'message': 'Project not found'})
    
    # Get form data
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    rating = int(request.form.get('rating', 5))
    
    # Validate data
    if not all([name, email, phone]):
        return jsonify({'success': False, 'message': 'Please fill in all fields'})
    
    if rating < 1 or rating > 5:
        rating = 5  # Default to 5 stars if invalid
    
    # Save rating
    new_rating = save_rating(project_id, name, email, phone, rating)
    
    flash("Thank you for your rating!")
    
    # If AJAX request, return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({
            'success': True, 
            'message': 'Rating submitted successfully',
            'rating': new_rating
        })
    
    # Otherwise redirect to the project page
    return redirect(url_for('view_project', project_id=project_id))

@app.route('/quick-rate/<int:project_id>', methods=['POST'])
def quick_rate_project(project_id):
    # Load all projects
    projects = []
    project_folders = [f for f in glob.glob(f'{PROJECTS_DIR}/*/') if os.path.isdir(f) and not f.endswith('blocks/')]
    
    for folder in project_folders:
        info_file = os.path.join(folder, 'info.json')
        if os.path.exists(info_file):
            with open(info_file, 'r') as f:
                try:
                    project = json.load(f)
                    projects.append(project)
                except json.JSONDecodeError:
                    pass
    
    project = next((p for p in projects if p['id'] == project_id), None)
    
    if not project:
        flash("Project not found")
        return redirect(url_for('index'))
    
    # Get form data
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    rating = int(request.form.get('rating', 5))
    
    # Validate data
    if not all([name, email, phone]):
        flash("Please fill in all fields")
        return redirect(url_for('index'))
    
    if rating < 1 or rating > 5:
        rating = 5  # Default to 5 stars if invalid
    
    # Save rating
    save_rating(project_id, name, email, phone, rating)
    
    flash("Thank you for your rating!")
    return redirect(url_for('index'))

if __name__ == '__main__':
    init_ratings_file()
    app.run(debug=True) 