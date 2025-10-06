# 🧾 PaperTrail

> **Smart Receipt Management. Automated. Organized. Insightful.**

PaperTrail is a secure **fintech platform** that uses **AI**, **OCR**, and **Gmail integration** to automatically collect, parse, and organize receipts into a **personal or business expense dashboard**.  
It streamlines expense tracking by combining **automation**, **analytics**, and **intuitive design**—all in one place.

<img width="806" height="514" alt="image" src="https://github.com/user-attachments/assets/78ae6e82-7579-4e33-a2a3-73ecd5e765e9" />


---

## 💡 Inspiration

Our team was inspired by a simple frustration: **receipts are always getting lost**.  
Whether it’s a crumpled paper receipt or a digital one buried in an inbox, managing them manually is time-consuming and messy.

We wanted to solve that by creating a **smart, automated system** that could collect and organize receipts seamlessly—helping both individuals and small businesses **keep track of their spending effortlessly**.

---

## ⚙️ How We Built It

### 🖥️ Frontend
- **Next.js** + **Tailwind CSS** (with dark mode support)
<img width="806" height="510" alt="image" src="https://github.com/user-attachments/assets/9bda944b-3f7d-46d3-b6aa-b3cb96560f05" />


### 🧩 Backend
- **Supabase** for database and authentication  
- **Auth0** for secure login and user management

### 🧠 AI
- **Gemini 2.5 Flash** for OCR and structured text extraction
<img width="1916" height="903" alt="image" src="https://github.com/user-attachments/assets/4d498986-6021-4777-887e-b65edc2743e7" />
<img width="1892" height="903" alt="image" src="https://github.com/user-attachments/assets/a4e4bfde-cbdd-4524-b16d-4c9293d8b728" />


### 📧 Email Integration
- **Gmail API** for automatically fetching and parsing digital receipts

### 📊 Core Features
- Interactive **Dashboard** with visual analytics  
- **Upload Page** (including live camera capture for receipts)  
- **All Receipts** view and **Folder Organization**  
- **Automatic Gmail Receipt Syncing**
  
<img width="806" height="502" alt="image" src="https://github.com/user-attachments/assets/54c43b7a-81fe-42ed-b4b8-66f3b0284047" />

<img width="806" height="502" alt="image" src="https://github.com/user-attachments/assets/ac3bbbbe-172c-4f16-91f8-df35e8ca93fa" />

---

## 🧠 What We Learned

This project pushed us to explore new technologies and problem-solving strategies.  
We learned how to:

- Integrate multiple APIs (**Gmail**, **Gemini**, **Auth0**, **Supabase**) cohesively  
- Use **Gemini 2.5 Flash** for OCR and structured data extraction  
- Handle authentication flows using **Supabase** and **Auth0**  
- Visualize data effectively with **pie**, **bar**, **line**, and **dot** charts  

Our AI pipeline can be summarized as:
`f_receipt = P(G(I))`

Where:  
- `I`: Image or PDF input  
- `G`: Gemini model for extraction  
- `P`: Parser that structures output into fields like merchant, date, and total  

---

## 🚧 Challenges

We faced several hurdles during development:

- Integrating the **Gmail API** with **OAuth** was tricky and time-consuming  
- Fine-tuning the **Gemini extraction model** required extensive testing  
- **OCR accuracy** varied across lighting conditions and receipt types  
- Maintaining **consistent styling** (especially with dark mode) under time pressure  

---

## 🌍 Vision

We see PaperTrail helping individuals and small businesses **simplify expense tracking**.  
In the future, we’d love to add:

- 🤖 AI-powered **expense categorization**  
- 📤 Export options (e.g. **CSV**, **QuickBooks**)  
- 💰 **Budgeting insights** based on spending patterns  

---

## 🏁 Takeaway

PaperTrail showed us how powerful AI can be when combined with **thoughtful UX** and **solid engineering**.  
What started as a small annoyance—**lost receipts**—grew into a project that can **help people stay financially organized** with minimal effort.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|---------------|
| Frontend | Next.js, Tailwind CSS |
| Backend | Supabase, Auth0 |
| AI | Gemini 2.5 Flash |
| Email Integration | Gmail API |


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, clone the repository:

```bash
https://github.com/moibra05/papertrail.git
```

Then install dependencies:

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
