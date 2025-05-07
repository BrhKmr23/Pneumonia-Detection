# 🫁 Pneumonia Detection with Medical Advice using FastAPI & Gemini

This project is a lightweight API built using **FastAPI** for detecting **Pneumonia from chest X-ray images** using a deep learning model (`EfficientNet-B3`). Upon detection, it leverages **Google Gemini (LLM)** to generate medical advice based on the classification result.

---

## 🚀 Features

- Upload X-ray images for real-time prediction
- Classifies images as **Normal** or **Pneumonia**
- Generates **LLM-based medical advice** with confidence level
- Frontend-ready with static file support
- CORS-enabled for local development

---

## 🧠 Tech Stack

- `FastAPI` - Web framework
- `PyTorch` + `timm` - Model loading and inference
- `Google Generative AI (Gemini)` - LLM-generated medical advice
- `torchvision` - Image preprocessing
- `Pillow` - Image handling
- `CORS` - Cross-origin support
- `StaticFiles` - Frontend integration

---

## 📁 Project Structure

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrhKmr23/Pneumonia-Detection.git
   cd Pneumonia-Detection
   ```
   uvicorn main:app --reload
