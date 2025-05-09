
/**
 * Dynamically loads cards from an HTML partial into a target container.
 * Ensures real-image cards appear first, with optional fallback to placeholders.
 *
 * @param {Object} options
 * @param {string} options.file - Path to the HTML file to load.
 * @param {string} options.targetId - ID of the container to insert cards into.
 * @param {number|null} [options.limit] - Max number of cards to show.
 * @param {function|null} [options.filter] - Filter cards (receives each .col element).
 * @param {boolean} [options.shuffle] - Shuffle cards randomly.
 * @param {boolean} [options.prioritizeImages] - Prioritize real images over placeholders.
 */
function loadCards({ file, targetId, limit = null, filter = null, shuffle = false, prioritizeImages = false }) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById(targetId);
      if (!container) return;

      const temp = document.createElement("div");
      temp.innerHTML = html;

      let cards = Array.from(temp.querySelectorAll(".col"));
      if (filter) cards = cards.filter(filter);

      const randomize = arr => arr.sort(() => Math.random() - 0.5);
      const getName = el => {
        const nameEl = el.querySelector("h6");
        return nameEl ? nameEl.textContent.trim().toLowerCase() : "";
      };

      if (prioritizeImages) {
        let real = cards.filter(card => {
          const img = card.querySelector("img");
          return img && !img.src.includes("placeholder");
        });

        let placeholders = cards.filter(card => !real.includes(card));

        if (shuffle) {
          real = randomize(real);
          placeholders = randomize(placeholders);
        } else {
          real.sort((a, b) => getName(a).localeCompare(getName(b)));
          placeholders.sort((a, b) => getName(a).localeCompare(getName(b)));
        }

        cards = [...real, ...placeholders];

        if (limit) {
          // Ensure at least as many real cards as available are shown first
          cards = cards.slice(0, limit);
        }

      } else if (shuffle) {
        cards = randomize(cards);
        if (limit) cards = cards.slice(0, limit);
      } else {
        cards.sort((a, b) => getName(a).localeCompare(getName(b)));
        if (limit) cards = cards.slice(0, limit);
      }

      cards.forEach(card => container.appendChild(card.cloneNode(true)));

      if (typeof AOS !== 'undefined') AOS.refresh();
    });
}
