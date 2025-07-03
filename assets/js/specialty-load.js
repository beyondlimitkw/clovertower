const specialties = [
  { slug: "dentistry", name: "Dentistry", description: "Explore dental care specialists at Clover Tower." },
  { slug: "pediatrics", name: "Pediatrics", description: "Caring for children's health and wellness." },
  { slug: "urology", name: "Urology", description: "Specialists in urinary and male reproductive health." },
  { slug: "ent", name: "ENT", description: "Specialists in ear, nose, and throat care at Clover Tower." },
  { slug: "otology", name: "Otology", description: "Focused care for ear-related conditions and surgeries." },
  { slug: "plastic-surgery", name: "Plastic Surgery", description: "Expert cosmetic and reconstructive surgeons." },
  { slug: "gastroenterology", name: "Gastroenterology", description: "Digestive system specialists at Clover Tower." },
  { slug: "mental-health", name: "Mental Health", description: "Mental health and therapy specialists." },
  { slug: "surgery", name: "Surgery", description: "Expert surgical services across specialties." },
  { slug: "allergy", name: "Allergy", description: "Specialists treating allergy-related conditions." },
  { slug: "internal-geriatric-medicine", name: "Internal & Geriatric Medicine", description: "Comprehensive healthcare for adults and seniors." },
  { slug: "eyes-vision", name: "Eyes & Vision", description: "Expert eye care and vision services." },
  { slug: "physical-therapy", name: "Physical Therapy", description: "Rehabilitation and physical wellness services." },
  { slug: "radiology", name: "Radiology", description: "Advanced medical imaging and diagnostics." },
  { slug: "laboratory", name: "Laboratory", description: "Comprehensive lab testing and analysis." }
];

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function loadSpecialtyFromHash() {
  const hash = window.location.hash.slice(1).toLowerCase();
  const specialty = specialties.find(spec => spec.slug === hash);

  const title = document.getElementById("specialtyTitle");
  const desc = document.getElementById("specialtyDescription");
  const container = document.getElementById("specialtyCards");

  if (!specialty || !title || !desc || !container) return;

  title.innerText = specialty.name;
  desc.innerText = specialty.description;

  container.innerHTML = "";
  container.style.opacity = "0";

  setTimeout(() => {
    // Load doctors
    fetch("assets/components/doctor-cards.html")
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const doctorCards = Array.from(temp.querySelectorAll("[data-specialty]")).filter(card =>
          card.dataset.specialty.split(",").map(s => s.trim().toLowerCase()).includes(hash)
        );

        if (doctorCards.length > 0) {
          const doctorHeading = document.createElement("div");
          doctorHeading.className = "col-12";
          doctorHeading.innerHTML = '<h4 class="text-green mb-3">Doctors</h4>';
          container.appendChild(doctorHeading);

          shuffleArray(doctorCards).forEach(card => container.appendChild(card.cloneNode(true)));
        }

        // Load clinics
        fetch("assets/components/clinic-cards.html")
          .then(res => res.text())
          .then(clinicHTML => {
            const tempClinic = document.createElement("div");
            tempClinic.innerHTML = clinicHTML;

            const clinicCards = Array.from(tempClinic.querySelectorAll("[data-specialty]")).filter(card =>
              card.dataset.specialty.split(",").map(s => s.trim().toLowerCase()).includes(hash)
            );

            if (clinicCards.length > 0) {
              const clinicHeading = document.createElement("div");
              clinicHeading.className = "col-12 mt-5";
              clinicHeading.innerHTML = '<h4 class="text-green mb-3">Clinics</h4>';
              container.appendChild(clinicHeading);

              shuffleArray(clinicCards).forEach(card => container.appendChild(card.cloneNode(true)));
            }

            container.style.opacity = "1";
            if (typeof AOS !== "undefined") AOS.refresh();
          });
      });
  }, 300);
}

loadSpecialtyFromHash();
window.addEventListener("hashchange", loadSpecialtyFromHash);
