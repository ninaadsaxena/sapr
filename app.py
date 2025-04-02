from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import cv2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import tensorflow as tf
from transformers import AutoProcessor, AutoImageProcessor, AutoModel
import json
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-trained model from Hugging Face
model_id = "google/derm-foundation"
processor = AutoImageProcessor.from_pretrained(model_id)
model = AutoModel.from_pretrained(model_id)

# Load skincare products dataset
# You can replace this with your own dataset
products_df = pd.read_csv('skincare_products.csv')

@app.post("/analyze-skin")
async def analyze_skin(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    image_array = np.array(image)
    
    # Convert to RGB if needed
    if len(image_array.shape) > 2 and image_array.shape[2] == 4:
        image = image.convert('RGB')
        image_array = np.array(image)
    
    # Process image with the model
    inputs = processor(images=image, return_tensors="pt")
    with tf.device('/CPU:0'):  # Use CPU if GPU not available
        outputs = model(**inputs)
    
    # Extract features
    features = outputs.last_hidden_state.mean(dim=1).detach().numpy()
    
    # Basic skin analysis based on image features
    # This is a simplified example - you would use a more sophisticated analysis in production
    r, g, b = np.mean(image_array[:,:,0]), np.mean(image_array[:,:,1]), np.mean(image_array[:,:,2])
    
    # Simple skin type classification based on RGB values
    if r > 150 and g < 100:
        skin_type = "Sensitive"
    elif r > g and r > b:
        skin_type = "Dry"
    elif g > r and g > b:
        skin_type = "Oily"
    else:
        skin_type = "Combination"
    
    # Detect face
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    # Analyze skin concerns
    concerns = []
    if np.std(image_array[:,:,0]) > 40:
        concerns.append("Uneven skin tone")
    if np.mean(image_array) < 100:
        concerns.append("Dullness")
    if np.std(gray) > 50:
        concerns.append("Texture issues")
    
    # Return analysis results
    return {
        "skinType": skin_type,
        "concerns": concerns,
        "hydrationLevel": int(np.mean([r, g, b]) / 2.55),
        "uvDamage": int(np.std(image_array) / 1.5)
    }

@app.post("/recommend-products")
async def recommend_products(skin_data: dict):
    skin_type = skin_data.get("skinType", "")
    concerns = skin_data.get("concerns", [])
    
    # Filter products by skin type
    filtered_df = products_df[products_df['skin_type'].str.contains(skin_type, case=False, na=False)]
    
    # If no products match the skin type, use all products
    if filtered_df.empty:
        filtered_df = products_df
    
    # Create a TF-IDF vectorizer for product descriptions
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(filtered_df['description'].fillna(''))
    
    # Create a query string from concerns
    query = " ".join(concerns)
    
    # If no concerns, recommend popular products
    if not query:
        return {
            "products": filtered_df.sort_values('price', ascending=False).head(5).to_dict('records')
        }
    
    # Transform query to TF-IDF vector
    query_vec = tfidf.transform([query])
    
    # Calculate cosine similarity
    cosine_sim = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    # Get top 5 similar products
    similar_indices = cosine_sim.argsort()[:-6:-1]
    similar_products = filtered_df.iloc[similar_indices]
    
    return {
        "products": similar_products.to_dict('records')
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
