# 📈 Stock Chatbot (AI-Powered Financial Assistant)

An AI-powered stock assistant chatbot that helps users analyze stocks, ask financial questions, and interact with market data through a conversational interface.

This project combines **FastAPI (backend)**, **React (frontend)**, and **OpenAI APIs** to deliver intelligent responses and financial insights.

---

## 🚀 Features

* 🤖 AI-powered chatbot using OpenAI
* 📊 Stock-related query handling
* 💬 Real-time conversational interface
* 🗂️ Chat history stored using SQLite
* 🌐 Full-stack architecture (FastAPI + React)
* 🔐 Environment-based API key management

---

## 🏗️ Project Structure

```
stock_chatbot/
│
├── backend.py        # Main backend logic (FastAPI)
├── api.py            # API routes and chatbot handling
├── chatbot.db        # SQLite database (ignored in production)
├── requirements.txt  # Python dependencies
│
├── frontend/         # React frontend (Vite + TypeScript)
│   ├── src/
│   ├── public/
│   └── package.json
│
└── .gitignore
```

---

## ⚙️ Tech Stack

### Backend

* FastAPI
* Python
* SQLite
* OpenAI API

### Frontend

* React (Vite)
* TypeScript
* CSS

---

## 🔑 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/adityadubey381/stock_chatbot.git
cd stock_chatbot
```

---

### 2. Backend Setup

```bash
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

Create a `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

Run backend:

```bash
python backend.py
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Overview

* `POST /chat` → Send user query to chatbot
* Returns AI-generated response using OpenAI

---

## ⚠️ Important Notes

* Do NOT commit `.env` file (contains API keys)
* Database files (`.db`, `.db-shm`, `.db-wal`) are ignored
* Use `.env.example` for sharing configuration

---

## 🧠 How It Works

1. User sends a query from the React UI
2. Request hits FastAPI backend
3. Backend processes input and calls OpenAI API
4. Response is stored in SQLite
5. Result is returned to frontend

---

## 📌 Future Improvements

* 🔗 Zerodha portfolio integration
* 📈 Real-time stock market data
* 🧠 AI-based investment suggestions
* 📊 Portfolio analytics dashboard
* 🔐 User authentication system

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repo and submit a pull request.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Aditya Kumar Dubey**

* GitHub: https://github.com/adityadubey381
* LinkedIn: https://www.linkedin.com/in/aditya-kumar-dubey-9833b4278/

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!
