
/**
 * Dynamically loads cards from an HTML partial into a target container.
 * Supports optional filtering and limiting.
 * 
 * @param {Object} options
 * @param {string} options.file - Path to the HTML file to load.
 * @param {string} options.targetId - ID of the container to insert cards into.
 * @param {number|null} [options.limit] - Maximum number of cards to show.
 * @param {function|null} [options.filter] - Function to filter cards (receives each .col element).
 */
function loadCards({ file, targetId, limit = null, filter = null }) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById(targetId);
      if (!container) return;

      const temp = document.createElement("div");
      temp.innerHTML = html;

      let cards = Array.from(temp.querySelectorAll(".col"));
      if (filter) cards = cards.filter(filter);
      if (limit) cards = cards.slice(0, limit);

      cards.forEach(card => container.appendChild(card.cloneNode(true)));

      if (typeof AOS !== 'undefined') AOS.refresh();
    });
}
