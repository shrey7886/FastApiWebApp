from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="Simple Quiz App")

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Simple Quiz App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <div class="text-center">
                <h1>Welcome to the Simple Quiz App!</h1>
                <p class="lead">This is a basic working version.</p>
                <a href="/docs" class="btn btn-primary">View API Docs</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Server is running!"} 