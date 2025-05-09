// === Specialties List ===
const specialties = [
  { slug: "dentistry", name: "Dentistry", description: "Explore dental care specialists at Clover Tower." },
  { slug: "ent", name: "ENT", description: "Specialists in ear, nose, and throat care at Clover Tower." },
  { slug: "otology", name: "Otology", description: "Focused care for ear-related conditions and surgeries." },
  { slug: "plastic-surgery", name: "Plastic Surgery", description: "Expert cosmetic and reconstructive surgeons." },
  { slug: "pediatrics", name: "Pediatrics", description: "Caring for children's health and wellness." },
  { slug: "gastroenterology", name: "Gastroenterology", description: "Digestive system specialists at Clover Tower." },
  { slug: "internal&geriatric-medicine", name: "Internal & Geriatric Medicine", description: "Comprehensive healthcare for adults and seniors." },
  { slug: "ophthalmology", name: "Ophthalmology", description: "Expert eye care and vision specialists." },
  { slug: "psychiatry", name: "Psychiatry", description: "Mental health and therapy specialists." },
  { slug: "physical-therapy", name: "Physical Therapy", description: "Rehabilitation and physical wellness services." },
  { slug: "surgery", name: "Surgery", description: "Expert surgical services across specialties." },
  { slug: "urology", name: "Urology", description: "Specialists in urinary and male reproductive health." }
];

// === Helper: Shuffle an array ===
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// === Load content based on URL hash ===
function loadSpecialtyFromHash() {
  const hash = window.location.hash.slice(1).toLowerCase();
  const specialty = specialties.find(spec => spec.slug === hash);

  const title = document.getElementById("specialtyTitle");
  const desc = document.getElementById("specialtyDescription");
  const container = document.getElementById("specialtyCards");

  if (!specialty || !title || !desc || !container) return;

  title.innerText = specialty.name;
  desc.innerText = specialty.description;

  container.style.opacity = "0";

  setTimeout(() => {
    container.innerHTML = "";

    fetch("assets/components/doctor-cards.html")
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;

        let cards = Array.from(temp.querySelectorAll("[data-specialty]")).filter(card =>
          card.dataset.specialty
            .split(",")
            .map(s => s.trim().toLowerCase())
            .includes(hash)
        );

        cards = shuffleArray(cards);

        if (cards.length > 0) {
          cards.forEach(card => container.appendChild(card.cloneNode(true)));
        } else {
          container.innerHTML = `<div class="col text-center">No specialists listed yet for this field.</div>`;
        }

        container.style.opacity = "1";
        if (typeof AOS !== "undefined") AOS.refresh();
      });
  }, 300);
}

// === Init on load and hash change ===
loadSpecialtyFromHash();
window.addEventListener("hashchange", loadSpecialtyFromHash);
