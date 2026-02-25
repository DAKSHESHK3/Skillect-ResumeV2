# Skillect-ResumeV2 🚀

AI-powered resume intelligence platform with 6 AI providers.

## Features
- 📊 AI Resume Scoring & Analysis
- 📝 Resume Fix Suggestions
- 🧠 Skill Gap Analysis  
- 📚 Learning Resource Recommendations
- 🚀 Opportunity Finder
- 🎯 Job Description Matcher
- ✉️ Cover Letter Generator
- ✨ Resume Generator (5 tones: Professional, Enthusiastic, Creative, Concise, ATS-Optimized)
- ⬇ PDF Export
- 🌗 Dark / Light Mode Toggle
- ⚖️ Judge Panel Mode (all AIs simultaneously)

## AI Providers
| Provider | Model | Env Var |
|---|---|---|
| Claude | claude-sonnet-4 | `ANTHROPIC_API_KEY` |
| Mistral | mistral-small-latest | `MISTRAL_API_KEY` |
| Groq | llama-3.3-70b-versatile | `GROQ_API_KEY` |
| Cohere | command-r-plus | `COHERE_API_KEY` |
| OpenRouter | llama-3.3-70b (free) | `OPENROUTER_API_KEY` |
| Together AI | llama-3.3-70b (free) | `TOGETHER_API_KEY` |

## Setup

### 1. Clone & Deploy to Vercel
```bash
git clone https://github.com/DAKSHESHK3/Skillect-ResumeV2
```
Import repo at [vercel.com](https://vercel.com) — zero config needed.

### 2. Add API Keys in Vercel
Go to **Settings → Environment Variables** and add whichever keys you have.
At minimum, add `ANTHROPIC_API_KEY`. All others are optional free-tier keys.

### Get Free API Keys
- **Groq** (free): https://console.groq.com
- **Together AI** (free): https://api.together.ai
- **OpenRouter** (free tier): https://openrouter.ai
- **Mistral** (free tier): https://console.mistral.ai
- **Cohere** (free tier): https://dashboard.cohere.com

## Project Structure
```
Skillect-ResumeV2/
├── api/
│   └── analyze.js   # Multi-provider serverless function
├── index.html       # Full frontend SPA
├── vercel.json      # Vercel deployment config
└── README.md
```
