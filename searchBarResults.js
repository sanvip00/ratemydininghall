function searchDiningOptions() {
    // Get the search query entered by the user and convert it to lowercase
    var query = document.getElementById('query').value.toLowerCase();
    // Get all dining options
    var options = document.querySelectorAll('.dining-options');
  
    // Iterate through each dining option
    options.forEach(function(option) {
      // Get the text content of the dining option and convert it to lowercase
      var text = option.textContent.toLowerCase();
      // Check if the text content includes the search query
      if (text.includes(query)) {
        // If it includes the query, display the option
        option.style.display = 'block';
      } else {
        // If it does not include the query, hide the option
        option.style.display = 'none';
      }
    });
}