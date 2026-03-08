# SnapStrip 📸🎞

SnapStrip is a **browser-based film photobooth** that creates nostalgic **Polaroid-style photo strips** directly from your device camera.

It allows users to take multiple photos with a countdown, apply vintage-style filters, customize borders, and export a printable photostrip.

This project started as a small personal idea after my girlfriend discovered an online Polaroid generator but couldn’t print the photos. I decided to build a better version myself — and turn it into a **portfolio project** while improving my frontend development skills.

---

# ✨ Features

📷 **Live Camera Capture**
Capture photos directly using the browser camera.

⏱ **Countdown Timer**
Automatic 3-second countdown before each shot.

🎞 **Multiple Layouts**

* 2 shot strip
* 3 shot strip
* 4 shot strip
* 2×2 grid layout

🎨 **Vintage Filters**

* Natural
* Black & White
* Warm
* Cool
* Grain
* Fade

🎨 **Custom Borders**

* Dark
* White
* Cream
* Red
* Green

📅 **Optional Date Stamp**

🏷 **Brand Toggle**

📱 **Mobile Friendly UI**

* Camera tab
* Strip preview tab

🔁 **Retake Individual Shots**

⬇ **Download Photostrip**

🖨 **Print Ready Format**

---

# 🛠 Tech Stack

**Frontend**

* HTML5
* CSS3
* Vanilla JavaScript

**Web APIs**

* MediaDevices Camera API
* Canvas API
* DOM Manipulation

---

# 📂 Project Structure

```
snapstrip
│
├── index.html
├── style.css
├── script.js
│
├── README.md
└── LICENSE
```

---

# 🚀 How to Run

Clone the repository

```
git clone https://github.com/iftyzubaer/snapstrip.git
```

Open the folder

```
cd snapstrip
```

Then simply open

```
index.html
```

in your browser.

Allow **camera permissions** when prompted.

---

# 🧠 How It Works

1. Browser camera is accessed using the **MediaDevices API**
2. Video frames are captured into a **Canvas element**
3. Filters are applied using **Canvas context filters**
4. Images are stored as **Base64 data URLs**
5. The final photostrip is generated and exported as a **PNG image**

---

# 🎯 Project Goals

This project was built to explore:

* Camera access in the browser
* Canvas image manipulation
* Responsive UI design
* Frontend state management without frameworks

---

# 🗺 Future Improvements

Planned upgrades:

* React / Next.js version
* Photo stickers
* Text captions
* More film styles
* GIF photostrips
* Cloud saving
* Social media sharing
* Better mobile camera optimization

---

# 👨‍💻 Author

**Ifty Zubaer**

Software Engineering & Management
Chalmers University of Technology

Portfolio
https://iftyzubaer.vercel.app

GitHub
https://github.com/iftyzubaer

---

# ❤️ Acknowledgment

Built with love for **Raya Fatin Mobashera**.

---

# 📄 License

This project is licensed under the MIT License.