$(document).ready(function() {
  $('#myForm').on('submit', function(e) {
    e.preventDefault();
    $('#loader').show();
    $.ajax({
      url: $(this).attr('action'),
      type: $(this).attr('method'),
      data: $(this).serialize(),
      success: function(data) {
        $('#loader').hide();
        var jsonData = JSON.parse(data); // Parse the response string into a JSON object
        $('#response code').text(JSON.stringify(jsonData, null, 2)); // Pretty-print the JSON object
        Prism.highlightAll();
        $('.card').addClass('has-content'); // Add class to show the response box
      },
      error: function() {
        $('#loader').hide();
        $('#response').html('An error occurred.');
        $('.card').addClass('has-content'); // Add class to show the response box
      }
    });
  });
});
