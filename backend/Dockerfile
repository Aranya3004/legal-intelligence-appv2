FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr poppler-utils && rm -rf /var/lib/apt/lists/*
# Deployment (Bangla OCR): also install tesseract-ocr-ben and set OCR_LANG=eng+ben
WORKDIR /app
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
