import torch
import torchvision.transforms as transforms
from fastapi import FastAPI, File, UploadFile
from PIL import Image
import google.generativeai as genai
import io
import timm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000"],  # Restrict to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pretrained Model
model_path = "D:\Pragramming\Lung Pneumonia Classification\Model\pneumonia_efficientnet.pth"

# Create the same model architecture as training
model = timm.create_model("efficientnet_b3", pretrained=False, num_classes=2)  # Ensure num_classes=2

# Load saved weights
model.load_state_dict(torch.load(model_path, map_location="cpu"))
model.eval()
# Image Transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Configure Gemini 2 API
API_KEY = "AIzaSyCXTc-hQJX09BDEzM5xqcy_jNMIs5WnziE"  # Replace with your actual API key
genai.configure(api_key=API_KEY)
LLM_MODEL = "gemini-2.0-flash"


BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get absolute path of `api/`
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

def generate_medical_advice(condition, confidence):
    """
    Uses Gemini 2 LLM to generate medical advice based on the model's output.
    """
    prompt = f"""
    The AI detected a {condition} condition in a chest X-ray with {confidence:.2f}% confidence.
    Provide a brief medical analysis and step-by-step medication suggestion within 150 words.
    """
    try:
        model = genai.GenerativeModel(LLM_MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return "Medical advice unavailable at the moment."

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # Read image
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    image = transform(image).unsqueeze(0)  # Add batch dimension

    # Get model prediction
    with torch.no_grad():
        output = model(image)
        probabilities = torch.softmax(output, dim=1)
        confidence, predicted_class = torch.max(probabilities, 1)

    # Map class to label
    class_map = {0: "Normal", 1: "Pneumonia"}
    condition = class_map[predicted_class.item()]
    confidence_score = confidence.item() * 100  # Convert to percentage

    # Get medical advice from LLM
    medical_advice = generate_medical_advice(condition, confidence_score)

    return {
        "condition": condition,
        "confidence": f"{confidence_score:.2f}%",
        "medical_advice": medical_advice
    }
