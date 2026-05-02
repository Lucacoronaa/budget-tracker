from fastapi import FastAPI
from controllers import categories, auth, transactions, dashboard
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Budget Tracker API",version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://budget-tracker.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(categories.router)
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)



@app.get("/health")
def root():
    return {"message": "Budget Tracker API is running"}