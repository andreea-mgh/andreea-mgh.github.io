const deleteOnLoad = document.getElementById("#deleteonload");
if (deleteOnLoad) {
    deleteOnLoad.remove();
}

const params = new URLSearchParams(window.location.search);
const quizId = params.get("code");

if (quizId) {
    fetch(`/materiale/test.json`)
        .then(response => response.json())
        .then(data => {
            const quizContainer = document.querySelector('.quiz-container');
            const quiz = data.find(q => q.cod === quizId);
            if (quiz) {
                quizContainer.innerHTML = `<h2>${quiz.title}</h2><p>${quiz.description}</p>`;
                quiz.questions.forEach((question, index) => {
                    const questionHtml = `
                        <hr>
                        <div class="question">
                            ${index + 1}. ${question.question}
                            <ul>
                                ${question.options.map((option, i) => `<li><input type="radio" name="question${index}" value="${i}"> ${option}</li>`).join('')}
                            </ul>
                            <button class="submit-answer" data-index="${index}">Submit</button>
                            <p class="explanation" style="display:none;">${question.explanation}</p>
                        </div>
                    `;
                    quizContainer.innerHTML += questionHtml;
                });
                const submitButtons = document.querySelectorAll('.submit-answer');
                submitButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const questionIndex = button.getAttribute('data-index');
                        const selectedOption = document.querySelector(`input[name="question${questionIndex}"]:checked`);
                        if (selectedOption) {
                            const answerIndex = parseInt(selectedOption.value);
                            const question = quiz.questions[questionIndex];
                            if (answerIndex === question.answer) {
                                button.classList.add('correct');
                                button.textContent = 'Corect!';
                            } else {
                                button.classList.add('incorrect');
                                button.textContent = 'Greșit!';
                                const correctAnswer = question.options[question.answer];
                                const correctText = document.createElement('p');
                                correctText.textContent = `Răspunsul corect este: ${correctAnswer}`;
                                correctText.classList.add('correct-answer');
                                button.parentElement.appendChild(correctText);
                                
                            }
                            const explanation = button.nextElementSibling;
                            explanation.style.display = 'block';
                            button.disabled = true;
                        } else {
                            alert('Please select an answer.');
                        }
                    });
                });
            } else {
                quizContainer.innerHTML = '<p>Quiz not found.</p>';
            }
        })
        .catch(error => console.error('Error loading quiz:', error));
}
else {
    const quizContainer = document.querySelector('.quiz-container');
    quizContainer.style.flexDirection = 'row';
    quizContainer.style.justifyContent = 'center';
    quizContainer.style.alignItems = 'center';
    quizContainer.innerHTML = '<p>Scrie codul profesoarei aici:  </p>';
    const input = document.createElement('input');
    input.type = 'text';
    quizContainer.appendChild(input);
    quizContainer.appendChild(document.createElement('br'));
    const button = document.createElement('button');
    button.textContent = 'Go';
    button.addEventListener('click', () => {
        const code = input.value.trim();
        if (code) {
            window.location.href = `/materiale/test.html?code=${code}`;
        } else {
            quizContainer.innerHTML = '<p>Please enter a valid code.</p>';
        }
    }    );
    quizContainer.appendChild(button);
}