# Form & Field

An AI portfolio maker built with Java, Spring Boot, Spring AI, and Gemini. Describe your experience, choose a visual direction, generate a structured portfolio draft, then export it as a standalone HTML file.

## Requirements

- Java 21 or newer
- Apache Maven 3.9 or newer
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Run on Windows

PowerShell:

```powershell
$env:GEMINI_API_KEY = "your-key"
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080). The app can start before you have a key; generation becomes available after `GEMINI_API_KEY` is set and the server is restarted. The key is read by the Java server and is never sent to the browser. Do not commit your real key; `.env` is ignored by Git, and `.env.example` shows the supported variables.

To package the app:

```powershell
mvn package
java -jar target/portfolio-maker-0.0.1-SNAPSHOT.jar
```

## Deploy on Render

Use the [Render deploy link](https://render.com/deploy?repo=https://github.com/saksham390/Form-Field) or create a Blueprint in Render and select this repository. Render builds the app from `Dockerfile`; when prompted, enter `GEMINI_API_KEY` in the service's environment settings. Keep the key in Render's secret environment configuration, never in this repository. Render will provide the public `onrender.com` URL after the first successful deployment.

Optional configuration:

- `GEMINI_MODEL` selects the model (defaults to `gemini-2.5-flash`).
- `PORT` selects the HTTP port (defaults to `8080`).

## What it does

- Turns a natural-language brief into editable portfolio content using Spring AI `ChatClient` and Gemini.
- Offers editorial, playful, and minimal writing directions.
- Renders projects, skills, contact details, and an introduction in a live preview.
- Exports a self-contained HTML portfolio; no database or account is required.
- Keeps the API key server-side and does not persist submitted briefs.