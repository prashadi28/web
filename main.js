/**
 * SmartGlove - Research Project Website JavaScript (R26-IT-108)
 * Faculty of Computing, Sri Lanka Institute of Information Technology
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLiveTelemetry();
  initECGCanvas();
  initDocumentFilters();
  initMilestonesAccordion();
  initContactForm();
  initModal();
});

/* ===================================================================
   1. NAVBAR CONTROLS
   =================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', () => {
      menu.classList.toggle('open');
      const isOpen = menu.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close mobile menu on click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
      }
    });
  });

  // Active section scroll spy
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  });
}

/* ===================================================================
   2. SIMULATED LIVE TELEMETRY STREAM
   =================================================================== */
function initLiveTelemetry() {
  const hrElem = document.getElementById('live-hr');
  const spo2Elem = document.getElementById('live-spo2');
  const tempElem = document.getElementById('live-temp');
  const gsrElem = document.getElementById('live-gsr');
  const riskNumElem = document.getElementById('live-risk-num');
  const riskFillElem = document.getElementById('live-risk-fill');

  if (!hrElem) return;

  setInterval(() => {
    // Subtle realistic variations in physiological metrics
    const baseHR = 72;
    const currentHR = baseHR + Math.floor(Math.random() * 5) - 2;
    hrElem.innerHTML = `${currentHR} <small>BPM</small>`;

    const baseSpo2 = 98;
    const currentSpo2 = baseSpo2 + (Math.random() > 0.8 ? -1 : 0);
    if (spo2Elem) spo2Elem.innerHTML = `${currentSpo2} <small>%</small>`;

    const baseTemp = 36.4;
    const currentTemp = (baseTemp + (Math.random() * 0.2 - 0.1)).toFixed(1);
    if (tempElem) tempElem.innerHTML = `${currentTemp} <small>°C</small>`;

    const baseGsr = 1.42;
    const currentGsr = (baseGsr + (Math.random() * 0.1 - 0.05)).toFixed(2);
    if (gsrElem) gsrElem.innerHTML = `${currentGsr} <small>µS</small>`;

    // Risk index stays in safe/optimal zone (12 - 18)
    const risk = 14 + Math.floor(Math.random() * 5);
    if (riskNumElem) riskNumElem.textContent = risk;
    if (riskFillElem) riskFillElem.style.width = `${risk}%`;
  }, 2200);
}

/* ===================================================================
   3. ANIMATED 250 HZ ECG WAVEFORM CANVAS
   =================================================================== */
function initECGCanvas() {
  const canvas = document.getElementById('ecg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  window.addEventListener('resize', () => {
    if (!canvas) return;
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const points = [];
  const totalPoints = 120;
  for (let i = 0; i < totalPoints; i++) {
    points.push(height / 2);
  }

  let step = 0;

  function getECGSample(t) {
    const cycle = t % 40;
    const mid = height / 2;
    // P wave
    if (cycle === 8) return mid - 4;
    if (cycle === 9) return mid - 6;
    if (cycle === 10) return mid - 3;
    // QRS complex
    if (cycle === 15) return mid + 4; // Q
    if (cycle === 16) return mid - 20; // R peak
    if (cycle === 17) return mid + 8; // S dip
    // T wave
    if (cycle === 25) return mid - 5;
    if (cycle === 26) return mid - 8;
    if (cycle === 27) return mid - 6;
    return mid + (Math.random() * 1.5 - 0.75); // baseline noise
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    points.shift();
    points.push(getECGSample(step));
    step++;

    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    const dx = width / (totalPoints - 1);
    for (let i = 0; i < points.length; i++) {
      const x = i * dx;
      const y = points[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    requestAnimationFrame(render);
  }

  render();
}

/* ===================================================================
   4. DOCUMENT FILTERING & SEARCH
   =================================================================== */
function initDocumentFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const docCards = document.querySelectorAll('.doc-card');
  const searchInput = document.getElementById('doc-search-input');

  function filterCards() {
    const activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    docCards.forEach(card => {
      const cardType = card.dataset.type || '';
      const text = card.textContent.toLowerCase();

      const matchesCategory = activeCategory === 'all' || cardType === activeCategory;
      const matchesSearch = query === '' || text.includes(query);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
}

/* ===================================================================
   5. MILESTONES INTERACTIVE DROPDOWN & TIMELINE
   =================================================================== */
function initMilestonesAccordion() {
  const dropdown = document.getElementById('milestone-dropdown');
  const spotlight = document.getElementById('milestone-spotlight');

  const milestoneData = {
    proposal: {
      title: "Project Proposal & Topic Assessment Form (TAF)",
      marks: "10% Marks Allocated",
      date: "Month 02 (Completed)",
      status: "Completed & Approved",
      statusClass: "badge-green",
      desc: "Comprehensive project scoping, clinical justification of elderly trauma in Sri Lanka, ethics clearance for secondary datasets, and sensor hardware viability review.",
      deliverables: ["Topic Assessment Form V2.1", "Proposal Presentation Deck (.pptx)", "Sensor Interface Architecture", "Team Contribution Matrix"]
    },
    pp1: {
      title: "Progress Presentation 1 (PP1)",
      marks: "15% Marks Allocated",
      date: "Month 05 (Completed)",
      status: "Completed & Evaluated",
      statusClass: "badge-green",
      desc: "Initial individual component delivery and proof-of-concept verification. Testing raw sensor data filtering (AD8232 ECG 250 Hz, MAX30102 PPG, MPU6050 IMU, GSR) and training initial baseline classifiers on secondary databases.",
      deliverables: ["PP1 Slide Deck (15 Slides)", "Working Prototype Demonstration", "MIT-BIH, SisFall & WESAD Model Baselines", "Supervisor Panel Review"]
    },
    pp2: {
      title: "Progress Presentation 2 (PP2)",
      marks: "18% Marks Allocated",
      date: "Month 08 (Completed)",
      status: "Completed & Evaluated",
      statusClass: "badge-green",
      desc: "Dual-node hardware integration (Medical Glove Node + Waist Smart Belt), full FastAPI backend inference setup, 10/10 automated test suites passed, real-time WebSockets streaming, Master Risk Score fusion (0-100), and ambulance emergency routing evaluation.",
      deliverables: ["PP2 Slide Deck (29 Slides)", "Dual-Node Hardware Enclosures", "10/10 Backend Unit Tests Passed", "Master Risk Score & OpenStreetMap Routing"]
    },
    final: {
      title: "Final Assessment & Live Demonstration",
      marks: "40% Marks Allocated",
      date: "Month 12 (Scheduled)",
      status: "Scheduled / In Final Preparation",
      statusClass: "badge-red",
      desc: "Final formal examination before the university evaluation panel. Full real-time dual-node hardware execution, live simulated fall and arrhythmia trigger events, and Master Risk Index escalation to caregiver mobile dashboards.",
      deliverables: ["Comprehensive Final Assessment Deck", "Live Product Hardware Demonstration", "Common Integrated Solution Report (53 Pages)", "Evaluation Rubric Grading"]
    },
    viva: {
      title: "Viva Voce Oral Examination",
      marks: "Individual Viva Component",
      date: "Month 12 (Scheduled)",
      status: "Scheduled / Defense Stage",
      statusClass: "badge-red",
      desc: "Oral examination where each member defends their specific individual component: Arrhythmia Screening (IT22081148), Smart Belt Fall Detection (IT22196156), Respiratory/Sepsis Warning (IT22291196), and Stress Affective Computing (IT22146410).",
      deliverables: ["4 Individual Theses", "Oral Code Walkthrough", "Novelty & Mathematical Proof Defense", "Supervisor & External Panel Examination"]
    }
  };

  function updateSpotlight(key) {
    if (!spotlight || !milestoneData[key]) return;
    const data = milestoneData[key];
    spotlight.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <span class="badge-tag ${data.statusClass}">${data.status}</span>
          <span class="milestone-badge badge-marks">${data.marks}</span>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--slate-500); font-weight: 600;">Assessment Schedule: ${data.date}</span>
      </div>
      <h3 style="font-size: 1.4rem; color: var(--navy-900); margin-bottom: 0.75rem;">${data.title}</h3>
      <p style="font-size: 0.95rem; color: var(--slate-600); line-height: 1.65; margin-bottom: 1.25rem;">${data.desc}</p>
      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
        <div style="font-size: 0.78rem; font-family: var(--font-mono); font-weight: 700; color: var(--navy-900); text-transform: uppercase; margin-bottom: 0.5rem;">Evaluated Deliverables:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 0.65rem;">
          ${data.deliverables.map(d => `<span style="background: var(--white); border: 1px solid var(--slate-200); padding: 0.35rem 0.75rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: var(--slate-700);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3" style="display:inline; margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>${d}</span>`).join('')}
        </div>
      </div>
    `;
  }

  if (dropdown) {
    dropdown.addEventListener('change', (e) => {
      updateSpotlight(e.target.value);
    });
    updateSpotlight(dropdown.value || 'proposal');
  }
}

/* ===================================================================
   6. CONTACT FORM SUBMISSION
   =================================================================== */
function initContactForm() {
  const form = document.getElementById('project-contact-form');
  const alertBox = document.getElementById('form-feedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      showFeedback('Please fill out all required fields.', 'error');
      return;
    }

    // Friendly local mock submission response
    showFeedback('Thank you for your inquiry! Your message has been routed to Group R26-IT-108 researchers.', 'success');
    form.reset();
  });

  function showFeedback(text, type) {
    if (!alertBox) return;
    alertBox.textContent = text;
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = type === 'success' ? '#d1fae5' : '#fee2e2';
    alertBox.style.color = type === 'success' ? '#065f46' : '#991b1b';
    alertBox.style.border = `1px solid ${type === 'success' ? '#6ee7b7' : '#fca5a5'}`;
    alertBox.style.padding = '0.75rem 1rem';
    alertBox.style.borderRadius = '8px';
    alertBox.style.marginBottom = '1rem';
    alertBox.style.fontSize = '0.9rem';

    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 6000);
  }
}

/* ===================================================================
   7. MODAL VIEWER (PREVIEWS & ARCHITECTURE)
   =================================================================== */
function initModal() {
  const backdrop = document.getElementById('preview-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  window.openModal = function (title, contentHtml) {
    if (!backdrop) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = contentHtml;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('active')) {
      closeModal();
    }
  });
}
