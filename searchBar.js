// Search Bar Functionalility by Kayla Lu

// Function to search and filter colleges
function search_college() {
  let input = document.getElementById('query').value.toLowerCase();
  let x = document.getElementsByClassName('colleges');
  let list = document.getElementById('list');

  // Checks if the search bar is empty
  if (input === "") {
      list.style.display = "none";
      return;
  }

  // Affects user visibility of search bar
  // Filter and display colleges
  for (let i = 0; i < x.length; i++) {
      if (!x[i].innerHTML.toLowerCase().includes(input)) {
          x[i].style.display = "none";
      } else {
          x[i].style.display = "list-item";
      }
  }

  // Show the list
  list.style.display = "block";
}

// An event listener to detect when the search bar loses focus
document.getElementById('query').addEventListener('blur', function(event) {
  let queryInput = document.getElementById('query');
  let list = document.getElementById('list');
  let target = event.relatedTarget || event.explicitOriginalTarget || document.activeElement; // Cross-browser compatibility for relatedTarget

  // Check if the click target is outside of the search bar and the list
  if (target !== list && !list.contains(target) && target !== queryInput && !queryInput.contains(target)) {
    // Hide the list
    list.style.display = "none";
  }
});