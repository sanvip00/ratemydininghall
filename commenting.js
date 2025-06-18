function addComment() {
    var nameInput = document.getElementById('name');
    var commentInput = document.getElementById('comment');
    var commentList = document.getElementById('comment-list');

    var name = nameInput.value;
    var comment = commentInput.value;

    if (name && comment) {
        var commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = '<strong>' + name + ':</strong> ' + comment;
        commentList.appendChild(commentElement);

        // Clear form fields
        nameInput.value = '';
        commentInput.value = '';
    } else {
        alert('Please enter both name and comment.');
    }
}

