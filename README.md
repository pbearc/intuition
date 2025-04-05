# iNTUition (team 48) (transformasi)

This is our submission to NTU's iNTUition 2025 hackathon.

Our chosen track is to leverage AI agent to help companies ease the process of introducing new technologies to employees.

This repo contains 2 main folders, 1 meant for change manager, the other meant for average employees.

The aim of this project is to focus on "awareness" element from **AKDAR** framework, that is, let employees be aware of the new technologies available.

## Demo Videos

### Employee View

![Employee View](https://img.youtube.com/vi/FxAxspQRE3k/0.jpg)  
[![Watch Video](https://img.shields.io/badge/▶%20Watch%20Video-red)](https://youtu.be/FxAxspQRE3k)

### Change Professional View

![Change Professional View](https://img.youtube.com/vi/9RDqXmom4xg/0.jpg)  
[![Watch Video](https://img.shields.io/badge/▶%20Watch%20Video-red)](https://youtu.be/9RDqXmom4xg)

## set up

frontend:

```
npm install
npm start
```

backend:

```
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## NOTE:

the ai chatbots wouldn't work because we have removed the tokens before uploading to github.

---

# Problem Statement

**“ADKAR”** is a famous framework for change management systems. We would focus on the **“A”** for **awareness**, and **“R”** for **reinforcement**.

## Awareness

Employees are hesitant to adopt and be aware of new technology. This could be due to them being:

- Unfamiliarized
- Uninterested
- Busy

## Reinforcement

Even when employees are successfully onboarded, they tend to stick to their old ways of working afterward. They are:

- Inconsistent
  - In terms of picking up new technology into their routine.

---

# Proposed Solution

## AI Agent

### Unfamiliarized

We created AI agents that specialize in helping:

- **Managers** in generating the most suitable change plan by analyzing stakeholders, scope, action plan, and communication way before change happens.
- **Managers** in handling employees' moods and concerns about the change.
- **Employees** in suggesting what tools are suitable for their specialty.

### Busy

We created AI agents that will:

- Create Jira tickets.
- Set schedules in Google Calendar for the whole team for learning the changes.
- Help employees set a schedule to attend training.

### Innovation

### Uninterested

We implemented a gamified usage of new technology with an appealing frontend:

- The longer users interact with the new technology, the more they adopt it. They can plant flowers that grow bigger to earn points.

### Inconsistent

We created a dashboard visualizing the user’s and each team’s engagement rate with our services:

- The higher the engagement rate, the redder the square.
- This cultivates healthy competition among employees.
- Employees with high engagement rates can gain badges based on their tier.

---

# How it Works

### Employee’s POV

- **Schedule trainings** using the AI chatbot.
- **Engage with new technology** to maintain a higher engagement rate, resulting in a high tier and a cooler badge.
- **Ask the AI chatbot** for suggestions on higher optimization of technological tools.

### Change Professional’s POV

- **Plan**, discuss, and consult with stakeholders and AI for the change plan.
- Create the change plan and notify stakeholders using AI agents.
- **Monitor the change data in real-time** to measure adoption, foster resilience, and trust by addressing employees' concerns.
- After the changes, use the collected data for the next action plan generation.

---

# Tech Stack

### AI Agent

- AI agent for **CTO**
- AI agent for **employees**
- Is a **RAG**
- Scraped **MSD** data for knowledge
- Customized suggestions to increase technology engagement rate
- Has **Google Calendar** plugin
- Schedules trainings for users based on requests

### Frontend

- **React**

### Backend

- **FlaskAPI**
- **Mongoose DB**
