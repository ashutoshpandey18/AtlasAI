# Atlas AI - Land Feasibility & Site Selection Platform

Atlas AI is a tool that helps businesses find the best locations to build projects like solar farms, battery factories, or retail stores. It is powered by the Mireye Coordinate API.

---

## What Problem Does It Solve?

When a company wants to build a new facility, they need to check many details about the land:
* Is the land flat or steep?
* Does it flood?
* Are there wetlands or protected forests?
* Are there power lines or roads nearby?

Normally, land analysts spend weeks going to different government websites (like FEMA and USGS) to download maps and check these details by hand. 

**Atlas AI does this automatically in 4 seconds.** You type in the addresses you want to compare, and the app checks all of these details at once.

---

## How It Works (Step-by-Step)

1. **Find the Coordinates**: You enter up to 5 addresses. The app automatically finds their latitude and longitude.
2. **Fetch Land Details**: The app asks Mireye's database for details about those coordinates (like terrain slope, flood zone, and distance to roads/power lines).
3. **Calculate the Score**: The app grades each location from 0 to 100 based on what you are building. For example, a solar farm needs flat land and high solar exposure (aspect), while a retail store needs to be close to a main road.
4. **Write the Report**: The app uses AI to write a summary report for you. Every detail in the report includes a direct link to the official government source for proof.
5. **Smart Site-Shifting**: If a site is close to a wetland or protected area, the app recommends shifting the coordinates (e.g., "Move 200m North") to bypass the problem and raise your score.
6. **Chat with Siting Copilot**: You can chat with an AI assistant to ask questions about the site (like *"How close is the highway?"*), and it will reply using live coordinate data.


---


## What We Learned & Feedback for Mireye

We had a great experience building with Mireye. Here are a few things that could make it even better:
1. **Batch Fetching**: Siting is about comparing locations. Having an API endpoint that can fetch data for multiple coordinates at once would make comparisons much faster.
2. **Data Freshness**: It would be very helpful to see a \"Last Updated\" timestamp for the land data, so we know how new the records are.
3. **Obstruction Check**: Proximity (distance) is good, but knowing if there is a barrier (like a river or private property) between the site and the road would prevent building problems.

---

## How to Run the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your Keys
Create a `.env.local` file in the root folder and add your keys:
```env
MIREYE_API_TOKEN=your_mireye_api_token
GROQ_API_KEY=your_groq_api_key
```

### 3. Start the App
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.
