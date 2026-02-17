FROM python:3.11

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

RUN playwright install --with-deps chromium

COPY . ./

EXPOSE 8000

CMD ["python", "main.py"]

