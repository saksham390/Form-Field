const form = document.querySelector('#portfolio-form');
const briefInput = document.querySelector('#brief');
const characterCount = document.querySelector('#character-count');
const generateButton = document.querySelector('#generate-button');
const buttonLabel = document.querySelector('#button-label');
const formMessage = document.querySelector('#form-message');
const downloadButton = document.querySelector('#download-button');
const previewPage = document.querySelector('#portfolio-page');
let currentPortfolio = null;
let currentStyle = 'editorial';

const exampleBrief = "I'm Maya Chen, a product designer in Toronto with 7 years of experience. I currently lead design at Northstar Health, where I redesigned the patient onboarding flow. Before that I worked at Fieldnote, building collaboration tools for small teams. My strongest skills are product strategy, prototyping, research, and design systems. I care about making complicated services feel simple. I studied interaction design at OCAD University. Contact: maya@example.com. Projects: a patient intake redesign, a team planning app, and a community health directory.";

briefInput.addEventListener('input', () => {
  characterCount.textContent = briefInput.value.length;
});

document.querySelector('#example-button').addEventListener('click', () => {
  briefInput.value = exampleBrief;
  briefInput.dispatchEvent(new Event('input'));
  briefInput.focus();
});

document.querySelectorAll('input[name="style"]').forEach((input) => {
  input.addEventListener('change', () => {
    currentStyle = input.value;
    previewPage.dataset.style = currentStyle;
    document.querySelectorAll('.style-option').forEach((option) => option.classList.remove('is-selected'));
    input.closest('.style-option').classList.add('is-selected');
  });
});

async function updateConnection() {
  const dot = document.querySelector('#connection-dot');
  const label = document.querySelector('#connection-label');
  try {
    const response = await fetch('/api/status');
    const status = await response.json();
    dot.classList.toggle('is-ready', status.geminiConfigured);
    label.textContent = status.geminiConfigured ? 'Gemini connected' : 'Gemini key needed';
  } catch {
    label.textContent = 'Server unavailable';
  }
}

function setText(id, value, fallback = '') {
  document.getElementById(id).textContent = value || fallback;
}

function renderPortfolio(portfolio) {
  previewPage.dataset.style = currentStyle;
  setText('preview-monogram', `${(portfolio.name || 'Y').trim().charAt(0).toUpperCase()}.`);
  setText('preview-name', portfolio.name, 'YOUR NAME');
  setText('preview-role', portfolio.role, 'INDEPENDENT CREATIVE');
  setText('preview-headline', portfolio.headline, 'A good story starts with you.');
  setText('preview-introduction', portfolio.introduction, 'A little introduction goes here.');
  setText('preview-location', portfolio.location, 'BASED SOMEWHERE');
  setText('preview-about', portfolio.introduction, 'A thoughtful introduction is on its way.');
  setText('preview-email', portfolio.email, "LET'S MAKE SOMETHING GOOD");
  setText('preview-version', 'DRAFT READY');
  setText('preview-status', 'Your story, taking shape');
  setText('project-count', `01 — ${String((portfolio.projects || []).length).padStart(2, '0')}`);

  const projectContainer = document.querySelector('#preview-projects');
  projectContainer.replaceChildren();
  (portfolio.projects || []).forEach((project, index) => {
    const row = document.createElement('article');
    row.className = 'project-row';
    const number = document.createElement('span');
    number.className = 'project-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = project.name || 'Selected project';
    const description = document.createElement('p');
    description.textContent = [project.category, project.description].filter(Boolean).join(' · ');
    copy.append(title, description);
    const arrow = document.createElement('span');
    arrow.className = 'project-arrow';
    arrow.textContent = '↗';
    row.append(number, copy, arrow);
    projectContainer.append(row);
  });

  const experienceContainer = document.querySelector('#preview-experience');
  experienceContainer.replaceChildren();
  (portfolio.experience || []).forEach((experience) => {
    const row = document.createElement('article');
    row.className = 'experience-row';
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = experience.role || 'Experience';
    const description = document.createElement('p');
    description.textContent = [experience.company, experience.description].filter(Boolean).join(' · ');
    const period = document.createElement('span');
    period.textContent = experience.period || '';
    copy.append(title, description);
    row.append(copy, period);
    experienceContainer.append(row);
  });

  const skillsContainer = document.querySelector('#preview-skills');
  skillsContainer.replaceChildren();
  (portfolio.skills || []).slice(0, 8).forEach((skill) => {
    const tag = document.createElement('span');
    tag.textContent = skill;
    skillsContainer.append(tag);
  });
  document.querySelector('.portfolio-nav-availability').lastChild.textContent = ` ${portfolio.availability || 'OPEN TO OPPORTUNITIES'}`.toUpperCase();
  previewPage.classList.remove('empty-page');
  previewPage.style.animation = 'none';
  requestAnimationFrame(() => { previewPage.style.animation = ''; });
  downloadButton.disabled = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  if (!briefInput.value.trim()) {
    briefInput.focus();
    formMessage.textContent = 'Add a few details about yourself to get started.';
    return;
  }

  const style = new FormData(form).get('style');
  generateButton.disabled = true;
  buttonLabel.textContent = 'Finding the right words';
  document.querySelector('#preview-status').textContent = 'Gemini is shaping your story';
  document.querySelector('#preview-status').classList.add('loading-dots');

  try {
    const response = await fetch('/api/portfolio/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: briefInput.value.trim(), style })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Portfolio generation failed.');
    currentPortfolio = result;
    renderPortfolio(result);
  } catch (error) {
    formMessage.textContent = error.message || 'Something went wrong. Please try again.';
    document.querySelector('#preview-status').textContent = 'Ready when you are';
  } finally {
    generateButton.disabled = false;
    buttonLabel.textContent = 'Build my portfolio';
    document.querySelector('#preview-status').classList.remove('loading-dots');
  }
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

downloadButton.addEventListener('click', () => {
  if (!currentPortfolio) return;
  const safe = (value) => escapeHtml(value || '');
  const projects = (currentPortfolio.projects || []).map((project) => `
    <article><p>${safe(project.category)}</p><h2>${safe(project.name)}</h2><p>${safe(project.description)}</p></article>`).join('');
  const experience = (currentPortfolio.experience || []).map((item) => `
    <article><p>${safe(item.period)}</p><h2>${safe(item.role)} · ${safe(item.company)}</h2><p>${safe(item.description)}</p></article>`).join('');
  const skills = (currentPortfolio.skills || []).map((skill) => `<li>${safe(skill)}</li>`).join('');
  const socials = (currentPortfolio.socials || []).map((social) => {
    const url = safe(social.url);
    const safeUrl = /^(https:\/\/|mailto:)/i.test(url) ? url : '#';
    return `<a href="${safeUrl}">${safe(social.label)}</a>`;
  }).join(' · ');
  const pageBackground = currentStyle === 'playful' ? '#fff8f0' : '#f4f7f2';
  const displayFont = currentStyle === 'playful' ? 'Arial,sans-serif' : 'Georgia,serif';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safe(currentPortfolio.name)} — Portfolio</title><style>
    *{box-sizing:border-box}body{margin:0;background:${pageBackground};color:#19372e;font:16px/1.65 Georgia,serif}main{max-width:900px;margin:auto;padding:8vw 8vw 48px}header,footer{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #dce5dc;padding:15px 0;font:12px Arial,sans-serif}header{margin-bottom:12vh}h1{max-width:700px;font-family:${displayFont};font-size:clamp(42px,8vw,86px);line-height:1.05;font-weight:500}h1 em{color:#668777}h2{font-size:27px;font-weight:500}section{padding:35px 0;border-top:1px solid #dce5dc}section>p:first-child{font:11px Arial,sans-serif;color:#718078;letter-spacing:.1em;text-transform:uppercase}article{padding:15px 0;border-bottom:1px solid #e3e9e1}article p{margin:5px 0;color:#53685a}ul{display:flex;flex-wrap:wrap;gap:10px;padding:0;list-style:none}li{border:1px solid #dce5dc;padding:5px 10px;font:12px Arial,sans-serif}a{color:#315a48}footer{margin-top:50px;border-top:1px solid #dce5dc;border-bottom:0}</style></head><body><main>
    <header><strong>${safe(currentPortfolio.name)}</strong><span>${safe(currentPortfolio.role)}</span></header>
    <p>${safe(currentPortfolio.location)}</p><h1>${safe(currentPortfolio.headline)}</h1><p>${safe(currentPortfolio.introduction)}</p>
    <section><p>Selected work</p>${projects || '<p>Projects coming soon.</p>'}</section>
    <section><p>Experience</p>${experience || '<p>Experience coming soon.</p>'}</section>
    <section><p>About</p><p>${safe(currentPortfolio.introduction)}</p><ul>${skills}</ul></section>
    <footer><span>${safe(currentPortfolio.email)}</span><span>${socials}</span></footer>
    </main></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(currentPortfolio.name || 'my').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-portfolio.html`;
  link.click();
  URL.revokeObjectURL(link.href);
});

setText('preview-year', new Date().getFullYear());
updateConnection();