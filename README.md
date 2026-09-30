# ⛽ FuelGo — Doorstep Precision Fuel Delivery

> **Emergency fuel delivery directly to your vehicle's location.**

FuelGo is a web-based doorstep fuel delivery platform built by **Team EAGLE**. It is designed to help users request petrol or diesel during emergencies and provide location-aware delivery information through interactive maps and GPS-based tracking.

---

## 🚨 Problem Statement

Running out of fuel while travelling can leave vehicle owners stranded, especially when a petrol pump is not nearby or easily accessible.

In an emergency, users may need to spend significant time searching for a fuel station or arranging fuel manually. This can cause delays, inconvenience, and safety concerns.

**FuelGo addresses this problem by providing a digital platform for requesting doorstep fuel delivery directly to the user's vehicle location.**

---

## 💡 Proposed Solution

FuelGo provides a centralized web application through which users can:

- Request emergency petrol or diesel delivery.
- Share or use their current location.
- View delivery/service areas on an interactive map.
- Track fuel-delivery information using GPS-based functionality.
- Access fuel-related assistance through an AI assistant.
- View customer and order information.
- Access safety guidance.
- View government-sanction information.
- Inspect fuel-purchase and invoice-related information.

The application combines **AI assistance, geolocation, interactive maps, and a user-friendly interface** to create a convenient emergency fuel-delivery experience.

---

## ✨ Key Features

### ⛽ Emergency Fuel Ordering

Users can request doorstep delivery of:

- Petrol
- Diesel

The application is designed around emergency fuel requirements and doorstep delivery.

---

### 📍 GPS & Location Services

FuelGo uses browser geolocation capabilities to work with the user's location.

The application requests geolocation permission for location-based functionality.

---

### 🗺️ Interactive Maps

FuelGo includes an interactive map interface for visualizing locations, delivery/service areas, and fleet-related information.

Map functionality is powered using **MapLibre GL** and MapTiler configuration.

---

### 🚚 Live Fleet & Service-Area Visibility

The application provides a live fleet tracking and service-area interface that can display:

- Vehicle/location information
- Service coverage
- Delivery areas
- Distance information
- GPS-based location data

---

### 🤖 AI Fuel Assistant

FuelGo integrates Google's Gemini AI capabilities to provide an AI-powered fuel assistant.

The AI assistant is intended to provide users with fuel-related guidance and assistance.

The project uses the `@google/genai` package for Gemini integration.

---

### 🧾 Fuel Purchase & Invoice Information

FuelGo is designed to provide purchase/receipt-related information, including GST invoice functionality and petrol-bunk purchase proof.

---

### 🛡️ Safety Center

A dedicated Safety Center provides users with safety-related information and guidance associated with fuel delivery.

---

### 🏛️ Government Sanction Information

The application includes a Government Sanction section presenting information related to the project's stated emergency doorstep fuel-supply pilot.

---

### 📋 Customer Hub & Order History

Users can access customer-related information and review their fuel-order history through the application's customer and order sections.

---

## 🧠 AI Integration

FuelGo uses **Google Gemini AI** as part of its AI-powered fuel assistant.

The repository includes the Google GenAI package:

```text
@google/genai
